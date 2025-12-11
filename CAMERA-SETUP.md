# 📱 Camera Setup Guide

## Your 6 Existing Cameras

- **ATM-001-Main** → Your laptop webcam ✅ (already working)
- **ATM-002-Lobby** → Assign Phone/Laptop
- **ATM-003-External** → Assign Phone/Laptop
- **ATM-004-Vestibule** → Assign Phone/Laptop
- **ATM-005-MainEntrance** → Assign Phone/Laptop
- **ATM-006-SideView** → Assign Phone/Laptop

---

## 🚀 Quick Setup (10 minutes)

### Step 1: Install IP Webcam on Phones
- Play Store: **"IP Webcam"** (FREE)
- Open app → Click **"Start Server"**
- Note IP: `192.168.1.XXX:8080`

### Step 2: Update Stream URLs
Edit: `api/scripts/register-demo-cameras.js`
```javascript
const cameraUpdates = [
  { name: "ATM-001-Main", streamUrl: "0" },  // ✅ Your laptop
  { name: "ATM-002-Lobby", streamUrl: "http://192.168.1.100:8080/video" },  // Your IP here
  { name: "ATM-003-External", streamUrl: "http://192.168.1.101:8080/video" },
  // ... etc
];
```

### Step 3: Update & Test
```powershell
cd api
node scripts/register-demo-cameras.js

cd ../ai_service
python test_cameras.py
```

---

## 📋 Stream URL Format

| Device | URL Format | Example |
|--------|------------|---------|
| Laptop webcam | `0` | `0` |
| IP Webcam (Android) | `http://IP:8080/video` | `http://192.168.1.100:8080/video` |
| DroidCam | `http://IP:4747/video` | `http://192.168.1.100:4747/video` |

⚠️ **Must include `/video` at the end!**

---

## ✅ Demo Day Checklist

**Before Demo:**
- [ ] Charge all devices (>50%)
- [ ] Install IP Webcam apps
- [ ] All devices on same WiFi
- [ ] Props ready (mask, helmet)

**Setup (30 min before):**
- [ ] Start IP Webcam apps on all phones
- [ ] Note all device IPs
- [ ] Update `register-demo-cameras.js` with IPs
- [ ] Run: `node scripts/register-demo-cameras.js`
- [ ] Test: `python test_cameras.py` → Expect: ✅ 6 cameras
- [ ] Open web app → Verify all 6 feeds visible

**Demo Flow:**
1. Show all 6 live feeds
2. Normal face → No alert
3. Put mask → Alert triggered!
4. Put helmet → Alert triggered!
5. Show alerts on dashboard

---

## 🔧 Troubleshooting

### 📱 Camera Not Connecting

**Problem: "Cannot connect to camera stream"**

1. **Same WiFi?**
   ```powershell
   ipconfig  # Check your laptop IP
   # Should start with same numbers as phone (e.g., 192.168.1.xxx)
   ```

2. **IP Webcam running?**
   - App should show green "Stop Server" button
   - If "Start Server", click it

3. **Wrong IP address?**
   - IP changes when reconnecting to WiFi
   - Check current IP in app (top of screen)
   - Update `register-demo-cameras.js` with new IP

4. **Wrong URL format?**
   ```
   ❌ Wrong: http://192.168.1.100:8080
   ✅ Correct: http://192.168.1.100:8080/video
   ```

5. **Test in browser:**
   - Open Chrome: `http://192.168.1.100:8080/video`
   - Should show live video immediately

6. **Firewall blocking?**
   - Windows Firewall may block Python
   - Allow Python through firewall temporarily

### 🎥 Black Screen / No Video

1. **Phone screen off?**
   - Keep phone screen on during demo
   - Disable auto-lock: Settings > Display > Screen timeout > 30 min

2. **Low battery?**
   - Charge above 20%
   - Disable power saving mode
   - Keep plugged in

3. **Camera permissions?**
   - Settings > Apps > IP Webcam > Permissions > Camera

### 🌐 Network Issues

**Test connection:**
```powershell
ping 192.168.1.100  # Ping your phone
# Should see: Reply from 192.168.1.100: bytes=32 time=5ms
# If timeout, network problem!
```

**Fixes:**
- Too many devices? Disconnect unused ones
- Restart WiFi router
- Move closer to router
- Try 5GHz WiFi if available

### 🖥️ Service Issues

**Port already in use:**
```powershell
# Find what's using the port
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill process (use PID from above)
taskkill /F /PID [PID]
```

**MongoDB not running:**
```powershell
net start MongoDB
# Or check if running: mongosh
```

### 🎭 Detection Issues

**Mask/helmet not detected:**
- Stand 1-2 meters from camera
- Face camera directly
- Good lighting needed
- Wait 30 seconds between tests (cooldown)

**Lower detection threshold:**
```python
# In ai_service/app.py, change:
CONFIDENCE_THRESHOLD = 0.6  # Lower from 0.7
```

### 🚀 Quick Diagnostics

```powershell
# Test all services
curl http://localhost:3001/api/cameras  # API
curl http://localhost:5000/             # AI Service
curl http://localhost:5173              # Web App

# Test camera stream
curl http://192.168.1.100:8080/video

# Test Python modules
cd ai_service
.\venv\Scripts\Activate.ps1
python -c "import cv2, tensorflow, flask; print('OK!')"

# Network check
ipconfig | findstr IPv4
netstat -an | findstr "3001 5000 5173 8080"
```

### 🆘 Emergency Reset

```powershell
# Kill all processes
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Restart services
cd api && npm start
cd ai_service && python app.py
cd web && npm run dev

# Restart IP Webcam app
# Stop Server → Close App → Reopen → Start Server
```

### 📱 Phone-Specific Tips

**Android:**
- Disable battery optimization for IP Webcam
- Turn off Data Saver
- Enable "Stay awake" in Developer options

**Common Issues:**
- IP changed → Check app, update script
- App crashed → Restart app
- Phone locked → Disable auto-lock
- Slow WiFi → Move closer to router
