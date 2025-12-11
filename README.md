# ATM-GuardAI (Monorepo)

AI-powered ATM surveillance system with real-time mask and helmet detection.

- `web/` – React + Vite dashboard  
- `api/` – Express API + Socket.IO + MongoDB  
- `ai_service/` – Flask + TensorFlow/OpenCV  
- `infra/` – Docker Compose for local dev

## 🎥 Demo Setup - Use Phones/Laptops as Cameras

**Connect your phones and laptops to your existing 6 cameras for demo:**

📱 **[CAMERA-SETUP.md](./CAMERA-SETUP.md)** - Complete setup & troubleshooting guide

### Quick Steps:
1. Install **IP Webcam** on phones (free app)
2. Edit `api/scripts/register-demo-cameras.js` with your device IPs
3. Run: `cd api && node scripts/register-demo-cameras.js`
4. Test: `cd ai_service && python test_cameras.py`

Your existing cameras (ATM-001-Main through ATM-006-SideView) will use phones/laptops as video sources!

---

## Dev quickstart
```bash
cd infra
docker compose up --build
