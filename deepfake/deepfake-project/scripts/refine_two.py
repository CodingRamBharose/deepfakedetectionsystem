#!/usr/bin/env python3
import os
import glob
import cv2
import numpy as np
import pandas as pd
from tqdm import tqdm

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler

import torchvision.transforms as T
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# -----------------------------
# DEVICE (CPU ONLY)
# -----------------------------
DEVICE = torch.device("cpu")
print("\nTraining on:", DEVICE)

# -----------------------------
# CONFIG
# -----------------------------
NUM_FRAMES   = 12        # fewer frames = faster on CPU but still temporal
IMG_SIZE     = 192       # 192x192 is a good balance for EfficientNet-B0
BATCH_SIZE   = 4
NUM_WORKERS  = 2
NUM_EPOCHS   = 15
LR           = 2e-4
WEIGHT_DECAY = 1e-5
LSTM_HIDDEN  = 256
LSTM_LAYERS  = 1

SAVE_DIR = "./checkpoints"
os.makedirs(SAVE_DIR, exist_ok=True)

# -----------------------------
# PATHS (YOUR EXISTING STRUCTURE)
# -----------------------------
DRIVE_BASE = r"C:\Users\HP\OneDrive\Desktop\deepfakedetectionsystem\capstone\deepfake\deepfake-data\Preprocessed_data"
DEFAULT_METADATA = r"C:\Users\HP\OneDrive\Desktop\deepfakedetectionsystem\capstone\deepfake\deepfake-project\label\Gobal_metadata.csv"

DEFAULT_VIDEO_GLOBS = [
    os.path.join(DRIVE_BASE, "Celeb_fake_face_only-20251005T102638Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "Celeb_real_face_only-20251005T102345Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "DFDC_FAKE_Face_only_data-20251005T103328Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "DFDC_REAL_Face_only_data-20251005T103539Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "FF_Face_only_data-20251005T102832Z-1-001", "**", "*.mp4"),
]

# -----------------------------
# HELPERS
# -----------------------------
def load_global_labels(csv_path: str):
    df = pd.read_csv(csv_path, header=None, names=["file", "label"])
    df["file"] = df["file"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.upper().str.strip()
    df["label"] = df["label"].replace({"REAL": "REAL", "FAKE": "FAKE", "0": "REAL", "1": "FAKE"})
    return df

def build_video_list(globs_list):
    files = []
    for g in globs_list:
        files += glob.glob(g, recursive=True)
    # unique and sorted
    return sorted(list(dict.fromkeys(files)))

def build_df():
    labels = load_global_labels(DEFAULT_METADATA)
    videos = build_video_list(DEFAULT_VIDEO_GLOBS)

    rows = []
    for vf in videos:
        fname = os.path.basename(vf)
        match = labels[labels["file"] == fname]
        if len(match):
            rows.append({"video_path": vf, "label": match.iloc[0]["label"]})

    df = pd.DataFrame(rows)
    df = df.sample(frac=1).reset_index(drop=True)
    print(f"Total videos matched with labels: {len(df)}")
    print(df["label"].value_counts())
    return df

# -----------------------------
# DATASET
# -----------------------------
class VideoDataset(Dataset):
    def __init__(self, df, transforms, seq_len=NUM_FRAMES):
        self.df = df.reset_index(drop=True)
        self.transforms = transforms
        self.seq_len = seq_len

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.loc[idx]
        cap = cv2.VideoCapture(row["video_path"])
        frames = []

        ok = True
        while ok:
            ok, img = cap.read()
            if ok:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                frames.append(img)
        cap.release()

        if len(frames) == 0:
            frames = [np.zeros((IMG_SIZE, IMG_SIZE, 3), np.uint8)] * self.seq_len

        # uniformly sample seq_len frames
        idxs = np.linspace(0, len(frames) - 1, self.seq_len).astype(int)
        sampled = [frames[i] for i in idxs]

        processed = [self.transforms(f) for f in sampled]
        label = 1 if row["label"] == "FAKE" else 0

        return torch.stack(processed), label

# -----------------------------
# TRANSFORMS (CPU-FRIENDLY BUT STRONG)
# -----------------------------
normalize = T.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])

train_t = T.Compose([
    T.ToPILImage(),
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.RandomHorizontalFlip(),
    T.RandomApply([
        T.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.2, hue=0.02)
    ], p=0.7),
    T.RandomApply([
        T.GaussianBlur(kernel_size=3)
    ], p=0.3),
    T.ToTensor(),
    normalize,
])

val_t = T.Compose([
    T.ToPILImage(),
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.ToTensor(),
    normalize,
])

# -----------------------------
# MODEL: EfficientNet-B0 + BiLSTM (CPU BEST)
# -----------------------------
class VideoClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        base = efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)
        in_features = base.classifier[1].in_features
        base.classifier = nn.Identity()

        self.backbone = base
        self.lstm = nn.LSTM(
            input_size=in_features,
            hidden_size=LSTM_HIDDEN,
            num_layers=LSTM_LAYERS,
            batch_first=True,
            bidirectional=True
        )
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(2 * LSTM_HIDDEN, 2)

    def forward(self, x):
        # x: (B, T, C, H, W)
        B, T, C, H, W = x.shape
        x = x.view(B * T, C, H, W)
        feats = self.backbone(x)          # (B*T, feat)
        feats = feats.view(B, T, -1)      # (B, T, feat)

        out, _ = self.lstm(feats)
        out = out[:, -1, :]               # last time step (B, 2*H)
        out = self.dropout(out)
        logits = self.fc(out)
        return logits

# -----------------------------
# TRAINING LOOP
# -----------------------------
def train():
    df = build_df()

    split = int(0.8 * len(df))
    train_df = df.iloc[:split]
    val_df   = df.iloc[split:]

    # class balancing by label string
    train_label_counts = train_df["label"].value_counts()
    print("\nTrain label distribution:")
    print(train_label_counts)

    weights = train_df["label"].apply(lambda x: 1.0 / train_label_counts[x])
    sampler = WeightedRandomSampler(weights.values, len(weights))

    train_ds = VideoDataset(train_df, train_t)
    val_ds   = VideoDataset(val_df, val_t)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, sampler=sampler,
                              num_workers=NUM_WORKERS)
    val_loader   = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=NUM_WORKERS)

    model = VideoClassifier().to(DEVICE)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=4, T_mult=2)

    best_f1 = 0.0

    for epoch in range(NUM_EPOCHS):
        print(f"\nEpoch {epoch + 1}/{NUM_EPOCHS}")
        model.train()
        running_loss = 0.0

        for frames, labels in tqdm(train_loader, desc="Training"):
            frames = frames.to(DEVICE)
            labels = labels.to(DEVICE)

            optimizer.zero_grad()
            logits = model(frames)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * frames.size(0)

        scheduler.step()
        avg_loss = running_loss / len(train_loader.dataset)
        print(f"Train Loss: {avg_loss:.4f}")

        # -------- VALIDATION --------
        model.eval()
        y_true, y_pred = [], []

        with torch.no_grad():
            for frames, labels in tqdm(val_loader, desc="Validating"):
                frames = frames.to(DEVICE)
                logits = model(frames)
                preds = torch.argmax(logits, dim=1).cpu().numpy()
                y_pred.extend(preds)
                y_true.extend(labels.numpy())

        acc = accuracy_score(y_true, y_pred)
        _, _, f1, _ = precision_recall_fscore_support(
            y_true, y_pred, average="binary"
        )
        print(f"Val Acc = {acc:.4f} | F1 = {f1:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            path = os.path.join(SAVE_DIR, "best_cpu_efficientnet_b0_lstm.pth")
            torch.save(model.state_dict(), path)
            print(f"✅ New best model saved at {path}")

    print("\n🎯 Training complete! Best F1:", best_f1)


if __name__ == "__main__":
    train()
