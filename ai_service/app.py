# ai_service/app.py
from flask import Flask, request, jsonify
import os, io, base64, time
from PIL import Image
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Rescaling

# ---------- Config ----------
MODEL_PATHS = ["face_model_finetuned.h5", "face_model.h5"]
IMG_SIZE = int(os.environ.get("IMG_SIZE", 224))
CLASSES = ['normal face', 'with helmet', 'with mask']
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", 0.7))

# ---------- Load model ----------
custom_objects = {"Rescaling": Rescaling}
model = None
for p in MODEL_PATHS:
    if os.path.exists(p):
        try:
            model = tf.keras.models.load_model(p, custom_objects=custom_objects)
            print("Loaded model:", p)
            break
        except Exception as e:
            print("Failed to load", p, e)

if model is None:
    raise SystemExit("No model found. Place face_model_finetuned.h5 in ai_service/")

def preprocess_pil(img: Image.Image):
    img = img.convert("RGB").resize((IMG_SIZE, IMG_SIZE))
    arr = np.asarray(img).astype("float32") / 255.0
    return np.expand_dims(arr, 0)

def predict_image(img: Image.Image):
    inp = preprocess_pil(img)
    preds = model.predict(inp, verbose=0)[0]
    idx = int(preds.argmax())
    conf = float(preds[idx])
    label = CLASSES[idx]
    return {"type": label, "score": conf, "raw_probs": preds.tolist()}

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "model_loaded": True})

@app.route("/infer", methods=["POST"])
def infer():
    """
    Accepts:
     - JSON { "image_base64": "<base64>" }
     - multipart form-data with field "file"
     - optional 'device_id' in JSON to echo back
    Response:
      { events: [ { type, score, timestamp, device_id? } ], meta: {...} }
    """
    try:
        img = None
        # JSON + base64
        if request.is_json and request.json.get("image_base64"):
            b64 = request.json["image_base64"]
            data = base64.b64decode(b64.split(",")[-1])
            img = Image.open(io.BytesIO(data))
        # multipart
        elif "file" in request.files:
            img = Image.open(request.files["file"].stream)
        else:
            return jsonify({"error": "no image provided"}), 400

        result = predict_image(img)
        event = {
            "type": result["type"],
            "score": result["score"],
            "timestamp": int(time.time())
        }
        # include device_id if provided
        if request.is_json and request.json.get("device_id"):
            event["device_id"] = request.json.get("device_id")

        # response: keep shape compatible with your api utils
        return jsonify({"events": [event], "meta": {"confidence_threshold": CONFIDENCE_THRESHOLD}})
    except Exception as e:
        app.logger.exception("infer error")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 9000))
    app.run(host="0.0.0.0", port=port, debug=False)
