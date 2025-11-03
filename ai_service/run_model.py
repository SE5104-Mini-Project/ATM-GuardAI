# ai_service/run_model.py
import os
import sys
import time
import json
import cv2
import numpy as np
import threading
from datetime import datetime
import tensorflow as tf
from tensorflow.keras.layers import Rescaling
import requests

# -------------------- Configuration --------------------
Classes = ['normal face', 'with helmet', 'with mask']
IMG_SIZE = 224
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", 0.7))
ALERT_COOLDOWN = int(os.environ.get("ALERT_COOLDOWN", 30))

# Worker/API settings
API_EVENTS_URL = os.environ.get("API_EVENTS_URL")  # e.g. http://localhost:8080/events
AI_SERVICE_API_TOKEN = os.environ.get("AI_SERVICE_API_TOKEN")  # Bearer token to post to API
HEADLESS = os.environ.get("HEADLESS", "1") == "1"
SAVE_ALERT_IMAGES = True

CAMERAS = [
    {"id": 0, "name": "ATM #12 - City Branch", "location": "ATM #12 - City Branch", "camera": "Camera 1"},
    # add other cameras if desired
]

# -------------------- Load model --------------------
custom_objects = {"Rescaling": Rescaling}
MODEL_PATHS = ["face_model_finetuned.h5", "face_model.h5"]
model = None
for p in MODEL_PATHS:
    if os.path.exists(p):
        try:
            model = tf.keras.models.load_model(p, custom_objects=custom_objects)
            print(f"Loaded model: {p}")
            break
        except Exception as e:
            print(f"Failed loading {p}: {e}")

if model is None:
    print("No model found. Train and save a model first.")
    sys.exit(1)

model_input_shape = model.input_shape
print("Model input shape:", model_input_shape)

# -------------------- Load metadata --------------------
try:
    with open('model_info.json', 'r') as f:
        model_info = json.load(f)
        print("Model trained on:", model_info.get('training_date', 'unknown'))
        print("Classes:", model_info.get('classes', Classes))
except Exception as e:
    print("model_info.json not found; using default Classes.")

# -------------------- Face Detector --------------------
faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# -------------------- Alert Manager --------------------
class AlertManager:
    def __init__(self, cooldown=ALERT_COOLDOWN):
        self.active_alerts = {}
        self.cooldown = cooldown
        os.makedirs("alert_images", exist_ok=True)

    def _can_alert(self, cam_id, alert_type):
        key = f"{cam_id}_{alert_type}"
        now = time.time()
        last = self.active_alerts.get(key, 0)
        if now - last < self.cooldown:
            return False
        self.active_alerts[key] = now
        return True

    def send_alert(self, camera_id, alert_type, confidence, frame=None):
        if not self._can_alert(camera_id, alert_type):
            return False
        alert_id = f"alert_{camera_id}_{int(time.time())}"
        alert = {
            "id": alert_id,
            "type": alert_type,
            "severity": "high" if alert_type in ["with mask", "with helmet"] else "medium",
            "status": "open",
            "description": f"Detected: {alert_type}",
            "camera": CAMERAS[camera_id].get("camera", f"Camera {camera_id}") if camera_id < len(CAMERAS) else f"Camera {camera_id}",
            "location": CAMERAS[camera_id].get("location", "unknown") if camera_id < len(CAMERAS) else "unknown",
            "time": datetime.now().strftime("%Y-%m-%d %I:%M:%S %p"),
            "confidence": float(confidence),
            "timestamp": datetime.now().isoformat()
        }
        print("ALERT:", json.dumps(alert, indent=2))
        if frame is not None and SAVE_ALERT_IMAGES:
            path = os.path.join("alert_images", f"{alert_id}.jpg")
            try:
                cv2.imwrite(path, frame)
                alert["image_path"] = path
            except Exception as e:
                print("Failed to save alert image:", e)

        # POST to API if configured
        if API_EVENTS_URL:
            try:
                payload = {
                    "source": "camera",
                    "level": "critical" if confidence > 0.8 else "warn",
                    "tags": [alert_type],
                    "data": alert
                }
                headers = {"Content-Type": "application/json"}
                if AI_SERVICE_API_TOKEN:
                    headers["Authorization"] = f"Bearer {AI_SERVICE_API_TOKEN}"
                r = requests.post(API_EVENTS_URL, json=payload, timeout=8, headers=headers)
                if r.status_code not in (200, 201):
                    print("API POST failed:", r.status_code, r.text)
                else:
                    print("Posted alert to API:", r.status_code)
            except Exception as e:
                print("Failed to POST to API:", e)

        return True

# -------------------- Preprocessing --------------------
def preprocess_face(face_bgr):
    face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
    face_resized = cv2.resize(face_rgb, (IMG_SIZE, IMG_SIZE))
    arr = face_resized.astype(np.float32) / 255.0
    return np.expand_dims(arr, axis=0)

def draw_box_and_label(frame, x, y, w, h, label, conf):
    color_map = {
        "with mask": (0, 0, 255),
        "with helmet": (0, 165, 255),
        "normal face": (0, 255, 0)
    }
    color = color_map.get(label, (255, 255, 255))
    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
    text = f"{label} {conf*100:.1f}%"
    cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# -------------------- Camera thread --------------------
stop_threads = False

def run_camera(cam_index, alert_manager):
    print(f"Starting camera {cam_index}")
    cap = cv2.VideoCapture(cam_index)
    if not cap.isOpened():
        print(f"Could not open camera {cam_index}")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    frame_counter = 0

    while not stop_threads:
        ret, frame = cap.read()
        if not ret:
            break
        frame_counter += 1
        # process every 3rd frame for speed
        if frame_counter % 3 != 0:
            if not HEADLESS:
                cv2.imshow(f"Camera {cam_index}", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))

        for (x, y, w, h) in faces:
            face_roi = frame[y:y+h, x:x+w]
            processed = preprocess_face(face_roi)
            preds = model.predict(processed, verbose=0)
            conf = float(np.max(preds))
            pred_idx = int(np.argmax(preds))
            label = Classes[pred_idx]
            draw_box_and_label(frame, x, y, w, h, label, conf)

            if conf >= CONFIDENCE_THRESHOLD and label != "normal face":
                alert_manager.send_alert(cam_index, label, conf, frame=frame)

        if not HEADLESS:
            cv2.imshow(f"Camera {cam_index}", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    cap.release()
    if not HEADLESS:
        cv2.destroyWindow(f"Camera {cam_index}")
    print(f"Stopped camera {cam_index}")

# -------------------- Signal handling --------------------
import signal
def signal_handler(sig, frame):
    global stop_threads
    print("Stopping threads...")
    stop_threads = True

signal.signal(signal.SIGINT, signal_handler)

# -------------------- Main --------------------
if __name__ == "__main__":
    print("Starting Detection System (headless: {})".format(HEADLESS))
    alert_manager = AlertManager()
    threads = []
    for i in range(len(CAMERAS)):
        t = threading.Thread(target=run_camera, args=(i, alert_manager), daemon=True)
        t.start()
        threads.append(t)
        time.sleep(1)

    # If no configured cameras, try default camera id 0
    if len(CAMERAS) == 0:
        t = threading.Thread(target=run_camera, args=(0, alert_manager), daemon=True)
        t.start()
        threads.append(t)

    try:
        while any(t.is_alive() for t in threads):
            time.sleep(0.5)
    except KeyboardInterrupt:
        stop_threads = True

    print("All cameras stopped. Exiting.")
