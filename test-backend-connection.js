// Test script to verify backend connection
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://web-production-95b5.up.railway.app'
    : 'http://localhost:5010');

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
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

  // Test actual login endpoint
  try {
    console.log(`\n🔍 Testing login endpoint: ${API_BASE_URL}/api/auth/login`);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        username: 'testuser', 
        password: 'testpass' 
      })
    });
    const data = await response.json();
    console.log(`✅ Login endpoint response:`, data);
  } catch (error) {
    console.error(`❌ Login endpoint failed:`, error.message);
  }
}

testBackendConnection();
