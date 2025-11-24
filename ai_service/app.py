import os
import sys
import time
import json
import base64
import threading
from datetime import datetime

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Rescaling
from flask import Flask, Response, jsonify, request
from flask_cors import CORS


# ------------- Configuration -------------
CLASSES = ['normal face', 'with helmet', 'with mask']
IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 0.7
ALERT_COOLDOWN = 30
CAMERAS = [
    {"id": 0, "name": "ATM #12 - City Branch", "location": "ATM #12 - City Branch", "camera": "Camera 1"},
    {"id": 1, "name": "ATM #07 - Main Street", "location": "ATM #07 - Main Street", "camera": "Camera 2"},
    {"id": 2, "name": "ATM #15 - Hospital Branch", "location": "ATM #15 - Hospital Branch", "camera": "Camera 1"},
    {"id": 3, "name": "ATM #09 - Shopping Mall", "location": "ATM #09 - Shopping Mall", "camera": "Camera 1"},
]

app = Flask(__name__)
CORS(app)


# ------------- Global Variables -------------
active_alerts = [] 
camera_status = {cam["id"]: {"status": "offline", "last_frame": None, "alerts": []} for cam in CAMERAS}


# ------------- Load Face Recognition Model -------------
custom_objects = {"Rescaling": Rescaling}
MODEL_PATHS = ["face_model_finetuned.h5", "face_model.h5"]
model = None

for path in MODEL_PATHS:
    if os.path.exists(path):
        try:
            model = tf.keras.models.load_model(path, custom_objects=custom_objects)
            print(f"[INFO] Loaded model: {path}")
            break
        except Exception as e:
            print(f"[WARNING] Failed loading {path}: {e}")

if model is None:
    print("[ERROR] No model found. Train and save a model first.")
    sys.exit(1)



# ------------- Face Detector -------------
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


# ------------- Alert Manager -------------
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

        current_time = datetime.now()
        alert_id = f"alert_{camera_id}_{current_time.strftime('%Y%m%d_%H%M%S')}"

        alert = {
            "id": alert_id,
            "type": alert_type,
            "severity": "high" if alert_type in ["with mask", "with helmet"] else "medium",
            "status": "open",
            "description": f"Detected: {alert_type}",
            "camera": CAMERAS[camera_id].get("name", f"Camera {camera_id}"),
            "location": CAMERAS[camera_id].get("location", "unknown"),
            "time": current_time.strftime("%Y-%m-%d %I:%M:%S %p"),
            "confidence": float(confidence),
            "timestamp": current_time.isoformat()
        }

        print("[ALERT]", json.dumps(alert, indent=2))

        active_alerts.append(alert)
        camera_status[camera_id]["alerts"].append(alert)

        if len(active_alerts) > 50:
            active_alerts.pop(0)

        if frame is not None:
            filename = f"{alert_id}.jpg"
            path = os.path.join("alert_images", filename)
            try:
                cv2.imwrite(path, frame)
                alert["image_path"] = path
                print(f"[INFO] Alert image saved: {filename}")
            except Exception as e:
                print(f"[WARNING] Failed to save alert image: {e}")

        return True


# ------------- Utility Functions -------------
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



# ------------- Camera Processing -------------
def process_camera_frame(cam_index, alert_manager):
    cap = cv2.VideoCapture(cam_index)
    if not cap.isOpened():
        return None, []

    ret, frame = cap.read()
    if not ret:
        cap.release()
        return None, []

    alerts = []
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))

    for (x, y, w, h) in faces:
        face_roi = frame[y:y+h, x:x+w]
        processed = preprocess_face(face_roi)
        preds = model.predict(processed, verbose=0)
        conf = float(np.max(preds))
        label = CLASSES[int(np.argmax(preds))]
        draw_box_and_label(frame, x, y, w, h, label, conf)

        # Send alert if confidence is high and not normal
        if conf >= CONFIDENCE_THRESHOLD and label != "normal face":
            if alert_manager.send_alert(cam_index, label, conf, frame=frame.copy()):
                alerts.append({
                    "type": label,
                    "confidence": conf,
                    "timestamp": datetime.now().isoformat()
                })

    cap.release()
    return frame, alerts

def generate_frames(cam_index):
    cap = cv2.VideoCapture(cam_index)
    while True:
        success, frame = cap.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))

        for (x, y, w, h) in faces:
            face_roi = frame[y:y+h, x:x+w]
            processed = preprocess_face(face_roi)
            preds = model.predict(processed, verbose=0)
            conf = float(np.max(preds))
            label = CLASSES[int(np.argmax(preds))]
            draw_box_and_label(frame, x, y, w, h, label, conf)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# ------------- Flask Routes -------------
@app.route('/')
def index():
    return jsonify({"message": "AI Surveillance System API", "status": "running"})

@app.route('/api/all-cameras', methods=['POST'])
def receive_all_cameras():
    global CAMERAS
    try:
        data = request.get_json()

        if not isinstance(data, list):
            return jsonify({"success": False, "message": "Invalid data format. Expected a list."}), 400

        CAMERAS  = data 

        return jsonify({
            "success": True,
            "message": "Camera data updated successfully",
            "total_cameras": len(CAMERAS)
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/alerts/recent')
def get_recent_alerts():
    recent = sorted(active_alerts, key=lambda x: x['timestamp'], reverse=True)[:10]
    return jsonify(recent)

@app.route('/video_feed/<int:camera_id>')
def video_feed(camera_id):
    return Response(generate_frames(camera_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/cameras/<int:camera_id>/snapshot')
def get_snapshot(camera_id):
    alert_manager = AlertManager()
    frame, alerts = process_camera_frame(camera_id, alert_manager)

    if frame is not None:
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        return jsonify({
            "success": True,
            "image": f"data:image/jpeg;base64,{frame_base64}",
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        })
    else:
        return jsonify({"success": False, "error": "Could not capture frame"})

# ------------- Main -------------
if __name__ == '__main__':
    print("[INFO] Starting Flask AI Surveillance API...")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)