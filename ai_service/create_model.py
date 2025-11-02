import os
import cv2
import numpy as np
import random
import json
import time
from datetime import datetime
import pickle
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, optimizers
from sklearn.model_selection import train_test_split
from sklearn.utils import class_weight
from sklearn.metrics import classification_report, confusion_matrix

# -------------------- Configuration --------------------
Data_directory = './images'
Classes = ['normal face', 'with helmet', 'with mask']
IMG_SIZE = 224
BATCH_SIZE = 32
SEED = 42
EPOCHS_INITIAL = 6    
EPOCHS_FINE = 12      
PATIENCE = 4


# -------------------- Helpers --------------------
def list_image_files(path):
    return [f for f in os.listdir(path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

def load_images_and_labels():
    X = []
    y = []
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
                    print("Skipped unreadable:", img_path)
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



# -------------------- Data Loading --------------------
X, y, class_counts = load_images_and_labels()

if len(y) == 0:
    raise SystemExit("No training images found. Put images inside ./images/<class_name>/")


# -------------------- Handle class imbalance --------------------
class_weights = class_weight.compute_class_weight('balanced', classes=np.unique(y), y=y)
class_weights_dict = {i: weight for i, weight in enumerate(class_weights)}
print("Class weights:", class_weights_dict)



# -------------------- Train/Test Split --------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=SEED, stratify=y
)

print(f"Train samples: {len(y_train)}, Test samples: {len(y_test)}")



# -------------------- Build tf.data pipelines --------------------
AUTOTUNE = tf.data.AUTOTUNE

def make_dataset(images, labels, shuffle=True, augment=False):
    ds = tf.data.Dataset.from_tensor_slices((images, labels))
    if shuffle:
        ds = ds.shuffle(buffer_size=1000, seed=SEED)
    def _preprocess(img, label):
        img = tf.image.convert_image_dtype(img, tf.float32)
        return img, label
    ds = ds.map(_preprocess, num_parallel_calls=AUTOTUNE)
    if augment:
        data_augmentation = tf.keras.Sequential([
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.06),
            layers.RandomZoom(0.08),
            layers.RandomTranslation(0.05, 0.05),
        ])
        def _augment(img, label):
            img = data_augmentation(img, training=True)
            return img, label
        ds = ds.map(_augment, num_parallel_calls=AUTOTUNE)
    ds = ds.batch(BATCH_SIZE).prefetch(AUTOTUNE)
    return ds