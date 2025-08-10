// Simple script to test if backend is running
const http = require('http');

const testEndpoints = [
  { path: '/health', port: 5010 },
  { path: '/api/test', port: 5010 }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: endpoint.port,
      path: endpoint.path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          endpoint: endpoint.path,
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        endpoint: endpoint.path,
        status: 'ERROR',
        error: err.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        endpoint: endpoint.path,
        status: 'TIMEOUT',
        error: 'Request timed out'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing backend endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    console.log(`${endpoint.path}:`);
    console.log(`  Status: ${result.status}`);
    if (result.data) {
      console.log(`  Response: ${result.data}`);
    }
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
  }
}

runTests();