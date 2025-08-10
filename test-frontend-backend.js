// Test script to verify frontend-backend connection
const puppeteer = require('puppeteer');

async function testFrontendBackendConnection() {
  console.log('🔍 Testing frontend-backend connection...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log('Browser console:', msg.text());
    });
    
    // Navigate to frontend
    console.log('🔍 Navigating to frontend...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Test the login functionality
    console.log('🔍 Testing login functionality...');
    
    // Click on login link/button if it exists
    try {
      await page.click('a[href="/login"], button:contains("Login"), [data-testid="login-link"]');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('No login link found, trying to find login form directly...');
    }
    
    // Look for login form
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('✅ Login form found');
      
      // Fill in test credentials
      await page.type('input[name="username"], input[type="text"]', 'testuser');
      await page.type('input[name="password"], input[type="password"]', 'testpass');
      
      // Submit the form
      await page.click('button[type="submit"], input[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check for error messages
      const errorElement = await page.$('.error, .alert, [data-testid="error"]');
      if (errorElement) {
        const errorText = await errorElement.evaluate(el => el.textContent);
        console.log('❌ Login error:', errorText);
      } else {
        console.log('✅ No immediate error found');
      }
    } else {
      console.log('❌ Login form not found');
    }
    
    // Test direct API call
    console.log('🔍 Testing direct API call from browser...');
    const apiResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5010/api/test');
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('API test result:', apiResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testFrontendBackendConnection();
