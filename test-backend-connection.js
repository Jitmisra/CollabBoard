// Test script to verify backend connection
const API_BASE_URL = 'https://web-production-09dde.up.railway.app';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);
    
    // Test auth endpoint
    console.log('\n2. Testing auth endpoint...');
    const authResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://collab-board-jade.vercel.app'
      },
      body: JSON.stringify({ username: 'test', password: 'test' })
    });
    const authData = await authResponse.json();
    console.log('✅ Auth endpoint:', authData);
    
    // Test CORS headers
    console.log('\n3. Testing CORS headers...');
    console.log('Access-Control-Allow-Origin:', authResponse.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', authResponse.headers.get('access-control-allow-methods'));
    console.log('Access-Control-Allow-Headers:', authResponse.headers.get('access-control-allow-headers'));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testBackendConnection();
