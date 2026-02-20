import os
import cv2
import numpy as np
import random

DATA_DIR = "./images"
CLASSES = ["normal face", "with helmet", "with mask"]

def adjust_brightness(img, factor=0.5):
    return cv2.convertScaleAbs(img, alpha=factor, beta=0)

def add_blur(img):
    return cv2.GaussianBlur(img, (7,7), 0)

def add_noise(img):
    noise = np.random.normal(0, 25, img.shape).astype(np.uint8)
    return cv2.add(img, noise)

def rotate_image(img):
    angle = random.randint(-25, 25)
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1)
    return cv2.warpAffine(img, M, (w, h))

def process_class(class_name):
    folder = os.path.join(DATA_DIR, class_name)
    images = [f for f in os.listdir(folder) if f.endswith((".jpg", ".png", ".jpeg"))]

    for img_name in images:
        path = os.path.join(folder, img_name)
        img = cv2.imread(path)

        if img is None:
            continue

        # Generate augmented versions
        dark = adjust_brightness(img, 0.4)
        blur = add_blur(img)
        noisy = add_noise(img)
        rotated = rotate_image(img)

        base = img_name.split(".")[0]

        cv2.imwrite(os.path.join(folder, f"{base}_dark.jpg"), dark)
        cv2.imwrite(os.path.join(folder, f"{base}_blur.jpg"), blur)
        cv2.imwrite(os.path.join(folder, f"{base}_noise.jpg"), noisy)
        cv2.imwrite(os.path.join(folder, f"{base}_rot.jpg"), rotated)

for cls in CLASSES:
    process_class(cls)

print("Dataset augmentation completed!")