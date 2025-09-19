#!/usr/bin/env node

// Script to set environment variables for frontend build
const fs = require('fs');
const path = require('path');

// Environment variables for production
const envVars = {
  REACT_APP_API_BASE_URL: 'https://web-production-95b5.up.railway.app',
  REACT_APP_SOCKET_URL: 'https://web-production-95b5.up.railway.app',
  REACT_APP_RAILWAY_URL: 'https://web-production-95b5.up.railway.app',
  REACT_APP_DEV_URL: 'http://localhost:5010',
  REACT_APP_FRONTEND_URL: 'https://collab-board-jade.vercel.app',
  REACT_APP_GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  REACT_APP_GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyAlZ-GzUfjF-UiVsh9q3zZiNYUA0mMgcd0'
};

// Create .env file content
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Write to .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Environment variables set for frontend build:');
console.log(envContent);
console.log(`📁 Written to: ${envPath}`);
console.log('\n🔗 Production URLs:');
console.log(`   Backend: ${envVars.REACT_APP_API_BASE_URL}`);
console.log(`   Frontend: ${envVars.REACT_APP_FRONTEND_URL}`);
console.log(`   WebSocket: ${envVars.REACT_APP_SOCKET_URL}`);
