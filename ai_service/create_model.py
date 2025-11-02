import tensorflow as tf
from tensorflow.keras import layers, models
import cv2
import os
import numpy as np
import random
import pickle

# -------------------- Define Data Directory and Classes --------------------
Data_directory = './images/'
Classes = ['normal face', 'with helmet', 'with mask']
img_size = 224


# -------------------- Create Training Data --------------------
training_Data = []

def create_training_data():
    for category in Classes:
        path = os.path.join(Data_directory, category)
        class_num = Classes.index(category)
        for img in os.listdir(path):
            try:
                img_array = cv2.imread(os.path.join(path, img))
                new_array = cv2.resize(img_array, (img_size, img_size))
                training_Data.append([new_array, class_num])
            except Exception as e:
                print("Error reading file:", img)
    return training_Data

create_training_data()
print("Total Training Samples:", len(training_Data))



# -------------------- Shuffle and Split Data --------------------
random.shuffle(training_Data)

X = []
Y = []

for features, label in training_Data:
    X.append(features)
    Y.append(label)

X = np.array(X).reshape(-1, img_size, img_size, 3) / 255.0
Y = np.array(Y)



# -------------------- Save Data Using Pickle --------------------
with open("X.pickle", "wb") as f:
    pickle.dump(X, f)

with open("Y.pickle", "wb") as f:
    pickle.dump(Y, f)