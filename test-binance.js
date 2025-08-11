// Test script to verify Binance API setup
// Run this with: node test-binance.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('✅ Loaded .env.local');
} else {
  console.log('❌ .env.local not found');
}

const apiKey = process.env.NEXT_PUBLIC_BINANCE_API_KEY || '';
const apiSecret = process.env.BINANCE_API_SECRET || '';

console.log('Testing Binance API setup...');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
console.log('API Secret:', apiSecret ? `${apiSecret.substring(0, 8)}...` : 'NOT SET');

if (!apiKey || !apiSecret) {
  console.error('❌ API credentials not configured properly');
  process.exit(1);
}

// Test signature generation
const timestamp = Date.now();
const queryString = `timestamp=${timestamp}`;
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(queryString)
  .digest('hex');

console.log('✅ Signature generation test passed');
console.log('Timestamp:', timestamp);
console.log('Query string:', queryString);
console.log('Signature:', signature.substring(0, 16) + '...');

// Test API call
const testApiCall = async () => {
  const url = `https://fapi.binance.com/fapi/v2/account?${queryString}&signature=${signature}`;
  
  try {
    // Use Node.js built-in fetch (available in Node 18+) or fallback to https
    let response;
    
    if (typeof fetch !== 'undefined') {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('✅ API call successful');
        const data = await response.json();
        console.log('Account balance:', data.totalWalletBalance);
      } else {
        const errorText = await response.text();
        console.error('❌ API call failed:', errorText);
      }
    } else {
      // Fallback for older Node.js versions
      const https = require('https');
      const { URL } = require('url');
      
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('Response status:', res.statusCode);
          
          if (res.statusCode === 200) {
            console.log('✅ API call successful');
            const parsed = JSON.parse(data);
            console.log('Account balance:', parsed.totalWalletBalance);
          } else {
            console.error('❌ API call failed:', data);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Network error:', error.message);
      });
      
      req.end();
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testApiCall();
