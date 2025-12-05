#!/usr/bin/env python3
"""
inference.py (FINAL TUNED + GRAD-CAM FIXED)
---------------------------------------------------
- EfficientNet-B0 + BiLSTM
- YuNet face detector
- FFT + Lip motion heuristics
- Stable REAL / FAKE / SUSPICIOUS decisions
- Grad-CAM explainability for FAKE & SUSPICIOUS
"""

import os
import cv2
import json
import torch
import argparse
import numpy as np
import torch.nn as nn
from torchvision import models, transforms

# ================= CONFIG =================
NUM_FRAMES = 16
NUM_SAMPLES = 5
IMG_SIZE = 192

FACE_MIN_SIZE = 90
FACE_MARGIN = 0.30

MEAN = [0.485, 0.456, 0.406]
STD  = [0.229, 0.224, 0.225]

# ================= PATHS =================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

CKPT_PATH = os.path.join(BASE_DIR, "scripts", "checkpoints",
                         "best_cpu_efficientnet_b0_lstm.pth")

YUNET_PATH = os.path.join(BASE_DIR, "scripts", "models",
                          "face_detection_yunet_2023mar.onnx")

if not os.path.exists(CKPT_PATH):
    raise FileNotFoundError("Checkpoint missing")

if not os.path.exists(YUNET_PATH):
    raise FileNotFoundError("YuNet model missing")

# ================= FACE DETECTOR =================
face_detector = cv2.FaceDetectorYN.create(
    YUNET_PATH, "", (320, 320), 0.5, 0.3, 5000
)

# ================= MODEL =================
class VideoClassifier(nn.Module):
    def __init__(self):
        super().__init__()

        base = models.efficientnet_b0(
            weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1
        )
        feat_dim = base.classifier[1].in_features
        base.classifier = nn.Identity()

        self.backbone = base
        self.lstm = nn.LSTM(
            feat_dim, 256, batch_first=True, bidirectional=True
        )
        self.fc = nn.Linear(512, 2)

    def forward(self, x):
        # x: [B,T,C,H,W]
        b, t, c, h, w = x.shape
        x = x.view(b * t, c, h, w)
        feats = self.backbone(x)                 # [B*T, F]
        feats = feats.view(b, t, -1)
        o, _ = self.lstm(feats)
        return self.fc(o[:, -1])

# ================= GRAD-CAM =================
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.activations = None
        self.gradients = None

        target_layer.register_forward_hook(self._forward_hook)
        target_layer.register_backward_hook(self._backward_hook)

    def _forward_hook(self, module, inp, out):
        self.activations = out

    def _backward_hook(self, module, grad_in, grad_out):
        self.gradients = grad_out[0]

    def generate(self, video_tensor, class_idx):
        """
        video_tensor: [1, T, C, H, W]
        """
        out = self.model(video_tensor)
        self.model.zero_grad()
        out[0, class_idx].backward()

        acts = self.activations        # [B*T, C, H, W]
        grads = self.gradients

        # Use first frame only
        acts = acts[0]
        grads = grads[0]

        weights = grads.mean(dim=(1, 2), keepdim=True)
        cam = (weights * acts).sum(dim=0)
        cam = torch.relu(cam)
        cam = cam.detach().cpu().numpy()

        cam = cv2.resize(cam, (IMG_SIZE, IMG_SIZE))
        cam = cam / (cam.max() + 1e-8)
        return cam

# ================= FACE UTILS =================
def detect_face(frame):
    h, w = frame.shape[:2]
    face_detector.setInputSize((w, h))
    _, faces = face_detector.detect(frame)

    if faces is None:
        return None

    faces = sorted(faces, key=lambda x: x[4], reverse=True)
    x, y, bw, bh = map(int, faces[0][:4])

    if bw < FACE_MIN_SIZE or bh < FACE_MIN_SIZE:
        return None

    mw = int(bw * FACE_MARGIN / 2)
    mh = int(bh * FACE_MARGIN / 2)

    return frame[
        max(0, y - mh):min(h, y + bh + mh),
        max(0, x - mw):min(w, x + bw + mw)
    ]

def extract_faces(video_path):
    cap = cv2.VideoCapture(video_path)
    faces = []

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face = detect_face(rgb)
        if face is not None:
            faces.append(cv2.resize(face, (IMG_SIZE, IMG_SIZE)))

    cap.release()
    if not faces:
        raise RuntimeError("No faces detected")

    return faces

# ================= PREPROCESS =================
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD)
])

def preprocess(frames):
    return torch.stack([transform(f) for f in frames])

# ================= HEURISTICS =================
def compute_fft_score(faces):
    vals = []
    for f in faces:
        g = cv2.cvtColor(f, cv2.COLOR_RGB2GRAY)
        fft = np.abs(np.fft.fftshift(np.fft.fft2(g)))
        h, w = fft.shape
        r = min(h, w) // 8
        center = fft[h//2-r:h//2+r, w//2-r:w//2+r]
        vals.append(1 - center.sum() / (fft.sum() + 1e-8))
    return float(np.mean(vals))

def compute_lip_score(faces):
    if len(faces) < 2:
        return 0.0

    diffs = []
    for i in range(1, len(faces)):
        diff = cv2.absdiff(
            cv2.cvtColor(faces[i], cv2.COLOR_RGB2GRAY),
            cv2.cvtColor(faces[i-1], cv2.COLOR_RGB2GRAY)
        )
        diffs.append(diff.mean())

    score = 1 - np.mean(diffs) / 6.0
    return float(np.clip(score, 0, 1))

# ================= SAVE HEATMAP =================
def save_heatmap(frame, cam, tag):
    heat = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(frame, 0.6, heat, 0.4, 0)

    out_dir = os.path.join(BASE_DIR, "gradcam_outputs")
    os.makedirs(out_dir, exist_ok=True)

    cv2.imwrite(
        os.path.join(out_dir, f"heatmap_{tag}.jpg"),
        cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)
    )

# ================= INFERENCE =================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = VideoClassifier().to(device)
    model.load_state_dict(torch.load(CKPT_PATH, map_location=device), strict=False)
    model.eval()

    gradcam = GradCAM(model, model.backbone.features[-1])

    faces = extract_faces(args.video)

    probs = []
    with torch.no_grad():
        for i in range(NUM_SAMPLES):
            clip = faces[i:i+NUM_FRAMES]
            if len(clip) < NUM_FRAMES:
                clip += [clip[-1]] * (NUM_FRAMES - len(clip))
            x = preprocess(clip).unsqueeze(0).to(device)
            probs.append(torch.softmax(model(x), 1)[0].cpu().numpy())

    real_p, fake_p = np.mean(probs, axis=0)

    fft = compute_fft_score(faces)
    lip = compute_lip_score(faces)
    suspicion = (fft + lip) / 2

    # ================= DECISION =================
    if fake_p >= 0.88 and (fake_p - real_p) >= 0.18:
        verdict = "FAKE"
    elif real_p >= 0.85 and (real_p - fake_p) >= 0.15 and suspicion < 0.65:
        verdict = "REAL"
    elif real_p > fake_p:
        verdict = "REAL (WEAK)"
    elif suspicion >= 0.75:
        verdict = "SUSPICIOUS"
    else:
        verdict = "SUSPICIOUS"

    print(f"\nPrediction : {verdict}")
    print(f"REAL probability : {real_p:.4f}")
    print(f"FAKE probability : {fake_p:.4f}")

    # ================= GRAD-CAM =================
    if verdict in ["FAKE", "SUSPICIOUS"]:
        clip = faces[:NUM_FRAMES]
        if len(clip) < NUM_FRAMES:
            clip += [clip[-1]] * (NUM_FRAMES - len(clip))
        x = preprocess(clip).unsqueeze(0).to(device)
        cam = gradcam.generate(x, class_idx=1)
        save_heatmap(clip[0], cam, verdict)

    print("===JSON_OUTPUT===")
    print(json.dumps({
        "video": os.path.basename(args.video),
        "prediction": verdict,
        "real_prob": round(float(real_p), 4),
        "fake_prob": round(float(fake_p), 4),
        "fft_score": round(float(fft), 4),
        "lip_score": round(float(lip), 4),
        "suspicion": round(float(suspicion), 4)
    }))
    print("===END_JSON===")

if __name__ == "__main__":
    main()
