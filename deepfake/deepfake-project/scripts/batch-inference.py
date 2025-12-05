import os
import subprocess
import json
import csv
import sys
import time

# ==============================
VIDEOS_DIR = r"C:\Users\Admin\Downloads\fake"
# change to fake folder if needed

INFERENCE_SCRIPT = "inference.py"
PYTHON_EXE = sys.executable
TIMEOUT = 180

OUTPUT_CSV = f"batch_results_{int(time.time())}.csv"
VIDEO_EXTS = (".mp4", ".avi", ".mov", ".mkv", ".MOV")
# ==============================

def extract_json_block(text):
    if "===JSON_OUTPUT===" not in text:
        return None

    start = text.index("===JSON_OUTPUT===") + len("===JSON_OUTPUT===")
    end = text.index("===END_JSON===")
    json_text = text[start:end].strip()
    return json.loads(json_text)

def main():
    if not os.path.exists(VIDEOS_DIR):
        print("❌ Folder not found")
        return

    videos = [v for v in os.listdir(VIDEOS_DIR) if v.lower().endswith(VIDEO_EXTS)]
    print(f"✅ Found {len(videos)} videos")

    rows = []

    for i, video in enumerate(videos, 1):
        path = os.path.join(VIDEOS_DIR, video)
        print(f"[{i}/{len(videos)}] Processing: {video}")

        try:
            proc = subprocess.run(
                [PYTHON_EXE, INFERENCE_SCRIPT, "--video", path],
                cwd=os.path.dirname(__file__),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                timeout=TIMEOUT,
                text=True,
                encoding="utf-8",
                errors="ignore"
            )

            data = extract_json_block(proc.stdout)

            if data is None:
                print("⚠️ JSON not found")
                rows.append([video, "UNKNOWN", "", "", "", ""])
            else:
                rows.append([
                    video,
                    data["prediction"],
                    data["real_prob"],
                    data["fake_prob"],
                    data["fft_score"],
                    data["lip_score"]
                ])
                print(f"✅ {data['prediction']}")

        except subprocess.TimeoutExpired:
            print("⏱️ TIMEOUT")
            rows.append([video, "TIMEOUT", "", "", "", ""])

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Video",
            "Prediction",
            "REAL_prob",
            "FAKE_prob",
            "FFT_score",
            "Lip_score"
        ])
        writer.writerows(rows)

    print("\n✅ Batch inference completed")
    print(f"📄 Saved to: {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
