/**
 * Quick Script to Update Existing Camera Stream URLs
 * Run: node scripts/register-demo-cameras.js
 * 
 * BEFORE RUNNING:
 * 1. Start your IP Webcam apps on phones and laptops
 * 2. Note down the IP addresses shown in the apps
 * 3. Update the streamUrls below with your actual IPs
 * 
 * This updates your existing 6 cameras with new stream URLs for demo.
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/cameras';

// 🔧 UPDATE THESE URLs WITH YOUR ACTUAL DEVICE IPs!
const cameraUpdates = [
  {
    name: "ATM-001-Main",
    streamUrl: "0",  // ✅ Your laptop webcam - Already working!
  },
  {
    name: "ATM-002-Lobby",
    streamUrl: "http://192.168.1.100:8080/video",  // 📱 Phone 1 - CHANGE THIS IP!
  },
  {
    name: "ATM-003-External",
    streamUrl: "http://192.168.1.101:8080/video",  // 📱 Phone 2 - CHANGE THIS IP!
  },
  {
    name: "ATM-004-Vestibule",
    streamUrl: "http://192.168.1.102:4747/video",  // 💻 Laptop 2 - CHANGE THIS IP!
  },
  {
    name: "ATM-005-MainEntrance",
    streamUrl: "http://192.168.1.103:8080/video",  // 📱 Phone 3 - CHANGE THIS IP!
  },
  {
    name: "ATM-006-SideView",
    streamUrl: "http://192.168.8.184:8080/video",  // Same as ATM-002 (shared camera) or use different device IP
  }
];

async function updateCameraStreams() {
  console.log('🚀 Updating Camera Stream URLs for Demo...\n');
  console.log('⚠️  Make sure:');
  console.log('   1. Node API is running (npm start in /api)');
  console.log('   2. IP Webcam apps are started on phones/laptops');
  console.log('   3. You updated the IP addresses in this script!\n');

  // First, get existing cameras
  let existingCameras = [];
  try {
    const response = await axios.get(API_URL);
    if (response.data.success) {
      existingCameras = response.data.data;
      console.log(`📹 Found ${existingCameras.length} existing cameras\n`);
    }
  } catch (error) {
    console.log('❌ Could not fetch existing cameras. Make sure API is running!\n');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const update of cameraUpdates) {
    try {
      // Find the existing camera by name
      const existingCamera = existingCameras.find(cam => cam.name === update.name);
      
      if (!existingCamera) {
        console.log(`⚠️  Camera ${update.name} not found in database. Skipping...`);
        failCount++;
        continue;
      }

      console.log(`📹 Updating ${update.name}...`);
      
      // Update only the streamUrl
      const response = await axios.put(
        `${API_URL}/${existingCamera._id}`,
        { streamUrl: update.streamUrl }
      );
      
      if (response.data.success) {
        console.log(`✅ ${update.name} updated successfully!`);
        console.log(`   🎥 New stream: ${update.streamUrl}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Failed to update ${update.name}`);
      if (error.response) {
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      failCount++;
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════');
  console.log('📊 Update Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📹 Total: ${cameraUpdates.length}`);
  console.log('═══════════════════════════════════════\n');

  if (successCount > 0) {
    console.log('🎉 Camera streams updated! Next steps:');
    console.log('   1. Restart AI Service: cd ai_service && python app.py');
    console.log('   2. Open Web App: http://localhost:5173');
    console.log('   3. Go to Live Feeds page to view all cameras');
    console.log('   4. Test mask/helmet detection!\n');
  }

  if (failCount > 0) {
    console.log('⚠️  Some cameras failed to update.');
    console.log('   Common issues:');
    console.log('   - Camera name mismatch');
    console.log('   - Invalid stream URLs');
    console.log('   - Network connectivity\n');
  }
}

async function checkAPIHealth() {
  try {
    const response = await axios.get('http://localhost:3001/api/cameras');
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🏥 Checking API health...');
  const isHealthy = await checkAPIHealth();
  
  if (!isHealthy) {
    console.log('❌ Cannot connect to API at http://localhost:3001');
    console.log('   Please start the Node API first:');
    console.log('   cd api && npm start\n');
    process.exit(1);
  }
  
  console.log('✅ API is running!\n');
  console.log('✅ API is running!\n');
  await updateCameraStreams();
}
main();
