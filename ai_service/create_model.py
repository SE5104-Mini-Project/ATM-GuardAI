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


train_ds = make_dataset(X_train, y_train, shuffle=True, augment=True)
val_ds = make_dataset(X_test, y_test, shuffle=False, augment=False)


# -------------------- Build Model (MobileNetV2) --------------------
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights='imagenet'
)

base_model.trainable = False

inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = layers.Rescaling(1.0)(inputs)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dense(256, activation='relu')(x)
x = layers.Dropout(0.4)(x)
outputs = layers.Dense(len(Classes), activation='softmax')(x)

model = models.Model(inputs, outputs)

model.compile(
    optimizer=optimizers.Adam(learning_rate=1e-3),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()


# -------------------- Callbacks --------------------
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
checkpoint_dir = "checkpoints"
os.makedirs(checkpoint_dir, exist_ok=True)
checkpoint_path = os.path.join(checkpoint_dir, f"model_initial_{timestamp}.h5")

cb_early = callbacks.EarlyStopping(monitor='val_loss', patience=PATIENCE, restore_best_weights=True)
cb_ckpt = callbacks.ModelCheckpoint(checkpoint_path, save_best_only=True, monitor='val_loss')
cb_reduce = callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-6)


# -------------------- Initial training --------------------
print("=== Starting initial training (backbone frozen) ===")
history1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_INITIAL,
    callbacks=[cb_early, cb_ckpt, cb_reduce],
    class_weight=class_weights_dict,
    verbose=1
)


# -------------------- Fine-tuning --------------------
print("=== Fine-tuning: unfreezing top layers of backbone ===")
base_model.trainable = True

fine_tune_at = int(len(base_model.layers) * 0.6) 
for i, layer in enumerate(base_model.layers):
    layer.trainable = i >= fine_tune_at
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False

print(f"Unfrozen layers from index {fine_tune_at} to {len(base_model.layers)-1}")

model.compile(
    optimizer=optimizers.Adam(learning_rate=1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

checkpoint_path_ft = os.path.join(checkpoint_dir, f"model_finetune_{timestamp}.h5")
cb_ckpt_ft = callbacks.ModelCheckpoint(checkpoint_path_ft, save_best_only=True, monitor='val_loss')

history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_FINE,
    callbacks=[cb_early, cb_ckpt_ft, cb_reduce],
    class_weight=class_weights_dict,
    verbose=1
)


# -------------------- Evaluate --------------------
print("=== Evaluation on test set ===")
y_pred_probs = model.predict(val_ds, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)

y_test_preds = np.argmax(model.predict(X_test, verbose=0), axis=1)

print("Classification Report:")
print(classification_report(y_test, y_test_preds, target_names=Classes))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_test_preds))



# -------------------- Save model and metadata --------------------
final_model_path = "face_model_finetuned.h5"
model.save(final_model_path)
print("Saved finetuned model to", final_model_path)

model_info = {
    "training_date": datetime.now().isoformat(),
    "classes": Classes,
    "img_size": IMG_SIZE,
    "train_samples": int(len(y_train)),
    "test_samples": int(len(y_test)),
    "class_counts": class_counts,
}

with open("model_info.json", "w") as f:
    json.dump(model_info, f, indent=2)

with open("X_test.pickle", "wb") as f:
    pickle.dump(X_test, f)
with open("Y_test.pickle", "wb") as f:
    pickle.dump(y_test, f)

print("Training complete. Model info saved to model_info.json")