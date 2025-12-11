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
import requests   # ← Added for Node.js API alerts


# ------------- Configuration -------------
CLASSES = ['normal face', 'with helmet', 'with mask']
IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 0.7
ALERT_COOLDOWN = 30
CAMERAS = []


app = Flask(__name__)
CORS(app)


# ------------- Global Variables -------------
active_alerts = [] 
camera_status = {}


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

    # -------- UPDATED HERE (Node.js API Integration) --------
    def send_alert(self, camera_id, alert_type, confidence, frame=None):
        if not self._can_alert(camera_id, alert_type):
            return False

        current_time = datetime.now()

        # Save image first
        alert_id = f"alert_{camera_id}_{current_time.strftime('%Y%m%d%H%M%S')}"
        image_path = None

        if frame is not None:
            filename = f"{alert_id}.jpg"
            path = os.path.join("alert_images", filename)
            try:
                cv2.imwrite(path, frame)
                image_path = path
                print(f"[INFO] Alert image saved: {filename}")
            except Exception as e:
                print(f"[WARNING] Failed to save alert image: {e}")

        # Prepare alert data for Node.js API
        alert_data = {
            "type": alert_type,
            "severity": "high" if alert_type in ["with mask", "with helmet"] else "medium",
            "description": f"Detected: {alert_type} with {confidence*100:.1f}% confidence",
            "cameraId": camera_id,
            "confidence": float(confidence * 100),  # Convert to percentage
            "imagePath": image_path
        }

        # Send to Node.js API
        try:
            response = requests.post(
                'http://localhost:3001/api/alerts',
                json=alert_data,
                timeout=5
            )

            if response.status_code == 201:
                print(f"[SUCCESS] Alert sent to API: {alert_data['type']}")
                return True
            else:
                print(f"[ERROR] Failed to send alert. Status: {response.status_code}")
                print(f"Response: {response.text}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Failed to send alert to API: {e}")
            return False
    # --------------------------------------------------------



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

def get_camera_source(camera_id):
    camera = next((cam for cam in CAMERAS if cam["_id"] == camera_id), None)
    if camera and "streamUrl" in camera:
        return camera["streamUrl"]
    return None


# ------------- Camera Processing -------------
def process_camera_frame(camera_id, alert_manager):
    stream_url = get_camera_source(camera_id)
    if not stream_url:
        print(f"[ERROR] No stream URL found for camera: {camera_id}")
        return None, []

    # Handle local webcam or integer index
    if stream_url == "0":
        stream_url = 0
    elif isinstance(stream_url, str) and stream_url.isdigit():
        stream_url = int(stream_url)

    cap = cv2.VideoCapture(stream_url)
    
    # Set timeout for network streams (RTSP, HTTP)
    if isinstance(stream_url, str) and (stream_url.startswith('rtsp://') or stream_url.startswith('http://')):
        cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 10000)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduce lag for IP cameras
    
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera stream: {stream_url}")
        return None, []

    ret, frame = cap.read()
    cap.release()  
    
    if not ret:
        print(f"[ERROR] Could not read frame from: {stream_url}")
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

        if conf >= CONFIDENCE_THRESHOLD and label != "normal face":
            if alert_manager.send_alert(camera_id, label, conf, frame=frame.copy()):
                alerts.append({
                    "type": label,
                    "confidence": conf,
                    "timestamp": datetime.now().isoformat()
                })

    return frame, alerts


def generate_frames(camera_id):
    stream_url = get_camera_source(camera_id)
    print(f"[INFO] Camera {camera_id} stream URL: {stream_url}")
    
    if not stream_url:
        print(f"[ERROR] No stream URL found for camera: {camera_id}")
        return
    
    # Handle local webcam (0) or integer index
    if stream_url == "0":
        stream_url = 0
    elif isinstance(stream_url, str) and stream_url.isdigit():
        stream_url = int(stream_url)

    cap = cv2.VideoCapture(stream_url)
    alert_manager = AlertManager()  # Create alert manager instance
    
    # Set buffer size for IP cameras to reduce lag
    if isinstance(stream_url, str):
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print(f"[ERROR] Could not open camera stream: {stream_url}")
        print(f"[HINT] For IP cameras, ensure the stream URL is accessible and device is on same network")
        return
    
    print(f"[INFO] Started streaming from: {stream_url}")
    
    while True:
        success, frame = cap.read()
        if not success:
            print(f"[WARNING] Failed to read frame from: {stream_url}")
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
            
            # Send alert if confidence is high and not a normal face
            if conf >= CONFIDENCE_THRESHOLD and label != "normal face":
                alert_manager.send_alert(camera_id, label, conf, frame=frame.copy())

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()
    print(f"[INFO] Stopped streaming from: {stream_url}")


# ------------- Flask Routes -------------
@app.route('/')
def index():
    return jsonify({"message": "AI Surveillance System API", "status": "running"})

@app.route('/api/all-cameras', methods=['POST'])
def receive_all_cameras():
    global CAMERAS, camera_status
    try:
        data = request.get_json()

        if not isinstance(data, list):
            return jsonify({"success": False, "message": "Invalid data format. Expected a list."}), 400

        CAMERAS = data 
        
        for camera in CAMERAS:
            cam_id = camera["_id"]
            camera_status[cam_id] = {
                "status": "online", 
                "last_frame": None, 
                "alerts": [],
                "streamUrl": camera.get("streamUrl", "")
            }

        print(f"[INFO] Updated camera list with {len(CAMERAS)} cameras")
        for cam in CAMERAS:
            print(f"  - {cam['_id']}: {cam.get('streamUrl', 'No stream URL')}")

        return jsonify({
            "success": True,
            "message": "Camera data updated successfully",
            "total_cameras": len(CAMERAS)
        })

    except Exception as e:
        print(f"[ERROR] Failed to process camera data: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/alerts/recent')
def get_recent_alerts():
    recent = sorted(active_alerts, key=lambda x: x['timestamp'], reverse=True)[:10]
    return jsonify(recent)

@app.route('/api/alerts/all')
def get_all_alerts():
    return jsonify(active_alerts)

@app.route('/api/cameras/status')
def get_camera_status():
    return jsonify(camera_status)

@app.route('/video_feed/<camera_id>')
def video_feed(camera_id):
    return Response(generate_frames(camera_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/cameras/<camera_id>/snapshot')
def get_snapshot(camera_id):
    alert_manager = AlertManager()
    
    frame, alerts = process_camera_frame(camera_id, alert_manager)

    if frame is not None:
        _, buffer = cv2.imencode('.jpg', frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        if camera_id in camera_status:
            camera_status[camera_id]["last_frame"] = datetime.now().isoformat()
        
        return jsonify({
            "success": True,
            "camera_id": camera_id,
            "image": f"data:image/jpeg;base64,{frame_base64}",
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        })
    else:
        return jsonify({
            "success": False, 
            "error": "Could not capture frame",
            "camera_id": camera_id
        })

@app.route('/api/cameras')
def get_cameras():
    return jsonify(CAMERAS)

@app.route('/api/cameras/<camera_id>')
def get_camera_info(camera_id):
    camera = next((cam for cam in CAMERAS if cam["_id"] == camera_id), None)
    if camera:
        return jsonify(camera)
    else:
        return jsonify({"error": "Camera not found"}), 404


# ------------- Main -------------
if __name__ == '__main__':
    print("[INFO] Starting Flask AI Surveillance API...")
    print("[INFO] Waiting for camera configuration via /api/all-cameras endpoint")
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
