#!/usr/bin/env python3
"""
Quick Camera Connection Tester
Tests if all your camera streams are accessible before running the main app
"""

import cv2
import sys
import requests

def test_stream(url, name):
    """Test if a camera stream is accessible"""
    print(f"\n🔍 Testing {name}...")
    print(f"   URL: {url}")
    
    try:
        # Convert "0" to integer for local webcam
        if url == "0":
            url = 0
        elif isinstance(url, str) and url.isdigit():
            url = int(url)
        
        cap = cv2.VideoCapture(url)
        
        if not cap.isOpened():
            print(f"   ❌ Cannot open stream")
            return False
        
        # Try to read a frame
        ret, frame = cap.read()
        cap.release()
        
        if ret and frame is not None:
            print(f"   ✅ Stream is working! Frame size: {frame.shape}")
            return True
        else:
            print(f"   ❌ Cannot read frames from stream")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_api_connection():
    """Test if Node API is running"""
    print("\n🔍 Testing Node API connection...")
    try:
        response = requests.get("http://localhost:3001/api/cameras", timeout=5)
        if response.status_code == 200:
            cameras = response.json()
            if cameras.get('success'):
                print(f"   ✅ API is running! Found {len(cameras.get('data', []))} cameras")
                return True, cameras.get('data', [])
        print(f"   ❌ API returned status: {response.status_code}")
        return False, []
    except Exception as e:
        print(f"   ❌ Cannot connect to API: {e}")
        return False, []

def main():
    print("═══════════════════════════════════════")
    print("🎥 ATM-GuardAI Camera Connection Tester")
    print("═══════════════════════════════════════")
    
    # Test API first
    api_ok, cameras = test_api_connection()
    
    if not api_ok:
        print("\n⚠️  Node API is not running!")
        print("   Start it with: cd api && npm start")
        return
    
    if not cameras:
        print("\n⚠️  No cameras registered!")
        print("   Register cameras with: cd api && node scripts/register-demo-cameras.js")
        return
    
    print(f"\n📹 Testing {len(cameras)} camera streams...")
    
    working = []
    failed = []
    
    for camera in cameras:
        cam_id = camera.get('_id')
        cam_name = camera.get('name', 'Unknown')
        stream_url = camera.get('streamUrl', '')
        
        if test_stream(stream_url, cam_name):
            working.append(cam_name)
        else:
            failed.append((cam_name, stream_url))
    
    print("\n═══════════════════════════════════════")
    print("📊 Test Results:")
    print(f"   ✅ Working: {len(working)}")
    print(f"   ❌ Failed: {len(failed)}")
    print("═══════════════════════════════════════")
    
    if working:
        print("\n✅ Working Cameras:")
        for name in working:
            print(f"   - {name}")
    
    if failed:
        print("\n❌ Failed Cameras:")
        for name, url in failed:
            print(f"   - {name}: {url}")
        print("\n💡 Troubleshooting Tips:")
        print("   1. Ensure all devices are on the same WiFi network")
        print("   2. Check if IP Webcam app is running (green 'Stop Server' button)")
        print("   3. Test URL in browser: open the stream URL directly")
        print("   4. Update IP addresses in the registration script if they changed")
        print("   5. Check Windows Firewall - may need to allow Python")
    
    if len(working) == len(cameras):
        print("\n🎉 All cameras are working! You're ready to start the demo!")
        print("   Run: python app.py")
    elif working:
        print(f"\n⚠️  {len(working)}/{len(cameras)} cameras working. Fix the failed ones or proceed with working cameras.")
    else:
        print("\n❌ No cameras are accessible. Please check your setup.")

if __name__ == "__main__":
    main()
