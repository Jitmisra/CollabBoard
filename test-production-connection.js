// Test script to verify production backend connection
const API_BASE_URL = 'https://web-production-95b5.up.railway.app';

async function testProductionConnection() {
  console.log('🔍 Testing production backend connection...');
  console.log('🔍 API Base URL:', API_BASE_URL);
  
  const endpoints = [
    '/health',
    '/api/test',
    '/api/auth/test'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      console.log(`✅ ${endpoint}:`, data);
    } catch (error) {
      console.error(`❌ ${endpoint} failed:`, error.message);
    }
  }

  // Test POST request to debug endpoint
  try {
    console.log(`\n🔍 Testing POST: ${API_BASE_URL}/api/auth/debug`);
    const response = await fetch(`${API_BASE_URL}/api/auth/debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'data' })
    });
    const data = await response.json();
    console.log(`✅ POST /api/auth/debug:`, data);
  } catch (error) {
    console.error(`❌ POST /api/auth/debug failed:`, error.message);
  }

  // Test CORS headers
  try {
    console.log(`\n🔍 Testing CORS headers...`);
    const response = await fetch(`${API_BASE_URL}/api/test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://collab-board-jade.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ CORS preflight response status:', response.status);
    console.log('✅ Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    console.log('✅ Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods'));
    console.log('✅ Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers'));
  } catch (error) {
    console.error(`❌ CORS test failed:`, error.message);
  }
}

testProductionConnection();
