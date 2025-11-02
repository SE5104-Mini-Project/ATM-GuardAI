import os
import sys
import json
import tensorflow as tf
from tensorflow.keras.layers import Rescaling

# -------------------- Configuration --------------------
Classes = ['normal face', 'with helmet', 'with mask']
IMG_SIZE = 224
CONFIDENCE_THRESHOLD = 0.7
ALERT_COOLDOWN = 30

CAMERAS = [
    {"id": 0, "name": "ATM #12 - City Branch", "location": "ATM #12 - City Branch", "camera": "Camera 1"},
    # {"id": 1, "name": "ATM #07 - Main Street", "location": "ATM #07 - Main Street", "camera": "Camera 2"},
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