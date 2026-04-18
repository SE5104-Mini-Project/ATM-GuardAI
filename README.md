# 🚀 ATM-GuardAI  
### 🎥 AI-Powered ATM Surveillance System 🔒  

<p align="center">
  <img src="https://img.shields.io/badge/AI-Deep%20Learning-blue?style=for-the-badge&logo=tensorflow">
  <img src="https://img.shields.io/badge/Computer%20Vision-OpenCV-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Backend-Node.js-black?style=for-the-badge&logo=node.js">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb">
</p>

<p align="center">
  <b>Real-time AI Surveillance for ATM Security using Deep Learning & Computer Vision</b>
</p>

---

## 📌 Overview

**ATM-GuardAI** is an intelligent AI-powered surveillance system designed to enhance ATM security.  
It detects suspicious activities in real-time and instantly alerts security personnel.

### 🔍 Detection Capabilities
- 🪖 Helmet Detection (Robbery indicator)
- 😷 Mask Detection (Disguise detection)
- 👤 Face Recognition (FaceNet)
- ⚠️ Suspicious Activity Alerts

---

## 🎥 Demo

<p align="center">
  <a href="https://www.linkedin.com/posts/activity-7432323055974244352-S2dN?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE51YIEBrTCtX1BSo373XMSL-9dyXkfWh1o">
    <img src="https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg" width="600">
  </a>
</p>

---

## 📸 Screenshots

<p align="center">
  <img src="./screenshots/dashboard.png" width="700"><br><br>
  <img src="./screenshots/helmet_detection.png" width="700"><br><br>
  <img src="./screenshots/mask_detection.png" width="700"><br><br>
  <img src="./screenshots/alert_system.png" width="700">
</p>

---

## 🧠 System Architecture

```mermaid
flowchart LR
A[Camera Feed] --> B[OpenCV Processing]
B --> C[YOLOv5 Detection]
C --> D[FaceNet Recognition]
D --> E[Backend API]
E --> F[WebSocket Alerts]
F --> G[Frontend Dashboard]
```
---

## 🛠️ Technologies and Tools Used

### 🤖 Artificial Intelligence & Computer Vision
- TensorFlow – Deep learning framework  
- OpenCV – Computer vision and video processing  
- YOLOv5 – Object detection  
- FaceNet – Face recognition  

### 🐍 Programming Language (AI/ML Service)
- Python 3.11  

### 💻 Backend
- Node.js  
- Express.js  
- MongoDB  

### 🌐 Frontend
- React.js  
- Vite  
- Tailwind CSS  

### 🔐 Authentication & Security
- JWT (JSON Web Token)  
- bcryptjs  

### ⚡ Real-time Communication
- WebSocket (Socket.IO)  
- MJPEG Streaming  

---

## 🚀 Features

- 🔥 Real-time video processing  
- ⚡ Instant alert system  
- 🎯 High accuracy detection using YOLOv5  
- 🔐 Secure authentication system  
- 💡 Modern and responsive UI  
- 📡 Live streaming dashboard  
