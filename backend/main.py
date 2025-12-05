from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import subprocess
import tempfile
import os
import shutil
import time
import re
import json

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# STATIC DIRECTORIES
# -----------------------
# Grad-CAM heatmap outputs directory
GRADCAM_DIRECTORY = r"C:\Users\HP\OneDrive\Desktop\deepfakedetectionsystem\deepfake\deepfake-project\gradcam_outputs"
os.makedirs(GRADCAM_DIRECTORY, exist_ok=True)

app.mount("/gradcam", StaticFiles(directory=GRADCAM_DIRECTORY), name="gradcam")


# ---------------------------------------
# UTILITY – Extract numeric part in name
# ---------------------------------------
def extract_num(filename):
    match = re.search(r'(\d+)', filename)
    return int(match.group(1)) if match else 0


# -----------------------
# PREDICT ENDPOINT
# -----------------------
@app.post("/predict")
async def predict(video: UploadFile = File(...)):

    # 1. CLEAN OLD GRAD-CAM OUTPUTS
    for filename in os.listdir(GRADCAM_DIRECTORY):
        file_path = os.path.join(GRADCAM_DIRECTORY, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f"Failed to delete {file_path}. Reason: {e}")

    # 2. SAVE UPLOADED VIDEO TEMPORARILY
    temp_dir = tempfile.mkdtemp()
    video_path = os.path.join(temp_dir, video.filename)

    with open(video_path, "wb") as f:
        f.write(await video.read())

    # 3. RUN MODEL (inference.py)
    scripts_dir = r"C:\Users\HP\OneDrive\Desktop\deepfakedetectionsystem\deepfake\deepfake-project\scripts"
    python_path = r"C:\Users\HP\OneDrive\Desktop\deepfakedetectionsystem\.venv\Scripts\python.exe"
    inference_script = os.path.join(scripts_dir, "inference.py")

    try:
        result = subprocess.run(
            [python_path, inference_script, "--video", video_path],
            capture_output=True, text=True, check=False, cwd=scripts_dir
        )
    finally:
        # Clean up temp video file
        try:
            os.remove(video_path)
            os.rmdir(temp_dir)
        except:
            pass

    output = result.stdout.strip()
    error_output = result.stderr.strip()

    print("Model Output (stdout):\n", output)
    if error_output:
        print("Model Error (stderr):\n", error_output)

    # ---------------------
    # PARSE JSON OUTPUT
    # ---------------------
    label = "UNKNOWN"
    prediction_data = {}
    
    # Extract JSON from output
    if "===JSON_OUTPUT===" in output and "===END_JSON===" in output:
        try:
            json_start = output.index("===JSON_OUTPUT===") + len("===JSON_OUTPUT===")
            json_end = output.index("===END_JSON===")
            json_str = output[json_start:json_end].strip()
            prediction_data = json.loads(json_str)
            label = prediction_data.get("prediction", "UNKNOWN")
        except (ValueError, json.JSONDecodeError) as e:
            print(f"Failed to parse JSON: {e}")
            # Fallback: parse from text output
            if "FAKE" in output.upper():
                label = "FAKE"
            elif "REAL" in output.upper():
                label = "REAL"
            elif "SUSPICIOUS" in output.upper():
                label = "SUSPICIOUS"
    else:
        # Fallback parsing
        if "FAKE" in output.upper():
            label = "FAKE"
        elif "REAL" in output.upper():
            label = "REAL"
        elif "SUSPICIOUS" in output.upper():
            label = "SUSPICIOUS"

    # ---------------------
    # BUILD GRAD-CAM URLS
    # ---------------------
    gradcam_urls = []
    timestamp = int(time.time())  # for cache busting

    if os.path.exists(GRADCAM_DIRECTORY):
        gradcam_files = sorted(os.listdir(GRADCAM_DIRECTORY))

        gradcam_urls = [
            f"http://127.0.0.1:8000/gradcam/{f}?v={timestamp}"
            for f in gradcam_files if f.endswith(('.jpg', '.png'))
        ]

    return {
        "label": label,
        "prediction": label,
        "raw_output": output,
        "error_output": error_output,
        "return_code": result.returncode,
        "prediction_data": prediction_data,
        "gradcam_urls": gradcam_urls,
        "frame_urls": gradcam_urls  # For backward compatibility with frontend
    }
