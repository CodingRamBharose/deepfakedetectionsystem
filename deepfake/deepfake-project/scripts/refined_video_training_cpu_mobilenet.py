#!/usr/bin/env python3
import os
import glob
from pathlib import Path
import numpy as np
import pandas as pd
import cv2
from tqdm import tqdm

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
from torchvision.models import mobilenet_v2
from torch.optim import AdamW
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

DEVICE = torch.device("cpu")
print(f"\n Training will use: {DEVICE}")

NUM_FRAMES = 16
IMG_SIZE = 160
BATCH_SIZE = 4
NUM_WORKERS = 2
NUM_EPOCHS = 12
LR = 3e-4
WEIGHT_DECAY = 1e-4
LSTM_HIDDEN = 256
LSTM_LAYERS = 1
PRETRAINED = True
SAVE_DIR = "./checkpoints"
os.makedirs(SAVE_DIR, exist_ok=True)

# ---- PATHS ----
DRIVE_BASE = r"C:\Users\HP\OneDrive\Desktop\deepfakedetectionsystem\capstone\deepfake\deepfake-data\Preprocessed_data"
DEFAULT_METADATA = r"C:\Users\HP\OneDrive\Desktop\deepfakedetectionsystem\capstone\deepfake\deepfake-project\label\Gobal_metadata.csv"

# ✅ UPDATED with your actual folder names + recursive search
DEFAULT_VIDEO_GLOBS = [
    os.path.join(DRIVE_BASE, "Celeb_fake_face_only-20251005T102638Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "Celeb_real_face_only-20251005T102345Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "DFDC_FAKE_Face_only_data-20251005T103328Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "DFDC_REAL_Face_only_data-20251005T103539Z-1-001", "**", "*.mp4"),
    os.path.join(DRIVE_BASE, "FF_Face_only_data-20251005T102832Z-1-001", "**", "*.mp4"),
]

def load_global_labels(metadata_csv=DEFAULT_METADATA):
    # ✅ CSV has NO HEADER
    df = pd.read_csv(metadata_csv, header=None, names=["file", "label"])
    df["file"] = df["file"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.upper().str.strip()
    df["label"] = df["label"].replace({"REAL": "REAL", "FAKE": "FAKE", "0": "REAL", "1": "FAKE"})
    return df

def build_video_list(globs_list):
    files = []
    for g in globs_list:
        files += glob.glob(g, recursive=True)
    return sorted(list(dict.fromkeys(files)))

def path_to_filename(path): return os.path.basename(path)

def build_df():
    labels = load_global_labels()
    videos = build_video_list(DEFAULT_VIDEO_GLOBS)

    rows = []
    for vf in videos:
        fname = path_to_filename(vf)
        match = labels.loc[labels["file"] == fname]
        if len(match):
            rows.append({"video_path": vf, "label": match.iloc[0]["label"]})

    df = pd.DataFrame(rows)
    df = df.sample(frac=1).reset_index(drop=True)
    return df

# ---- DATASET ----
class VideoDataset(Dataset):
    def __init__(self, df, transforms, seq_len=NUM_FRAMES, img_size=IMG_SIZE):
        self.df = df.reset_index(drop=True)
        self.transforms = transforms
        self.seq_len = seq_len
        self.img_size = img_size

    def __len__(self): return len(self.df)

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
            frames = [np.zeros((self.img_size, self.img_size, 3), np.uint8)] * self.seq_len

        idxs = np.linspace(0, len(frames)-1, self.seq_len).astype(int)
        frames = [frames[i] for i in idxs]
        frames = [self.transforms(cv2.resize(f, (self.img_size, self.img_size))) for f in frames]

        # ✅ FIXED LABEL ISSUE
        label = int(row["label"])
        return torch.stack(frames), label

# ---- TRANSFORMS ----
train_t = T.Compose([
    T.ToPILImage(),
    T.RandomResizedCrop(IMG_SIZE, scale=(0.7,1.0)),
    T.RandomHorizontalFlip(),
    T.ToTensor(),
])

val_t = T.Compose([
    T.ToPILImage(),
    T.Resize(IMG_SIZE),
    T.ToTensor(),
])

# ---- MODEL ----
class VideoClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        base = mobilenet_v2(pretrained=PRETRAINED)
        in_features = base.classifier[1].in_features
        base.classifier = nn.Identity()
        self.backbone = base
        self.lstm = nn.LSTM(in_features, LSTM_HIDDEN, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(2*LSTM_HIDDEN, 2)

    def forward(self, x):
        B,T,C,H,W = x.shape
        feats = self.backbone(x.view(B*T,C,H,W)).view(B,T,-1)
        out,_ = self.lstm(feats)
        return self.fc(out[:,-1,:])

# ---- TRAIN ----
def train():
    print("Using metadata + globs...")
    df = build_df()

    df["label"] = df["label"].map({"REAL":0, "FAKE":1})
    split = int(0.8 * len(df))
    train_df, val_df = df.iloc[:split], df.iloc[split:]

    train_ds = VideoDataset(train_df, train_t)
    val_ds = VideoDataset(val_df, val_t)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)

    model = VideoClassifier().to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)

    best_f1 = 0
    for epoch in range(NUM_EPOCHS):
        print(f"\nEpoch {epoch+1}/{NUM_EPOCHS}")
        model.train()
        for frames, labels in tqdm(train_loader, desc="Training"):
            frames, labels = frames.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            loss = criterion(model(frames), labels)
            loss.backward()
            optimizer.step()

        # ---- VAL
        model.eval()
        y_true, y_pred = [], []
        with torch.no_grad():
            for frames, labels in val_loader:
                frames = frames.to(DEVICE)
                logits = model(frames)
                preds = torch.argmax(logits, dim=1).cpu().numpy()
                y_pred.extend(preds)
                y_true.extend(labels.numpy())

        acc = accuracy_score(y_true, y_pred)
        _,_,f1,_ = precision_recall_fscore_support(y_true, y_pred, average='binary')
        print(f"Val Acc={acc:.4f} F1={f1:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            torch.save(model.state_dict(), os.path.join(SAVE_DIR, "best_model_mobilenet.pth"))
            print("✅ Best model saved!")

    print("\n🎯 Training complete! Best F1:", best_f1)

if __name__ == "__main__":
    train()
