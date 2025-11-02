# data_loader.py
import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.utils import class_weight

# -------------------- Configuration --------------------
Data_directory = './images'
Classes = ['normal face', 'with helmet', 'with mask']
IMG_SIZE = 224
SEED = 42
BATCH_SIZE = 32

# -------------------- Helpers --------------------
def list_image_files(path):
    return [f for f in os.listdir(path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

def load_images_and_labels():
    X, y = [], []
    counts = {}
    for idx, cls in enumerate(Classes):
        cls_path = os.path.join(Data_directory, cls)
        if not os.path.isdir(cls_path):
            print(f"WARNING: class directory not found: {cls_path}")
            continue
        files = list_image_files(cls_path)
        counts[cls] = len(files)
        print(f"Found {len(files)} images for class '{cls}'")
        for fname in files:
            try:
                img_path = os.path.join(cls_path, fname)
                img = cv2.imread(img_path)
                if img is None:
                    continue
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                X.append(img)
                y.append(idx)
            except Exception as e:
                print(f"Error reading {fname}: {e}")
    X = np.array(X, dtype=np.float32) / 255.0
    y = np.array(y, dtype=np.int32)
    print("Total samples:", len(y))
    return X, y, counts

# -------------------- Load Data --------------------
X, y, class_counts = load_images_and_labels()
if len(y) == 0:
    raise SystemExit("No training images found. Put images inside ./images/<class_name>/")

# -------------------- Class Weights --------------------
class_weights = class_weight.compute_class_weight('balanced', classes=np.unique(y), y=y)
class_weights_dict = {i: w for i, w in enumerate(class_weights)}

# -------------------- Train/Test Split --------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=SEED, stratify=y
)