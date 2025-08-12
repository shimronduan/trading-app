// Test script for the Next.js API proxy
const axios = require('axios');

async function testApiProxy() {
  try {
    console.log('Testing Next.js API proxy...');
    
    const response = await axios.get('http://localhost:3000/api/atr-multiples');
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      console.log('\n✅ API Proxy working correctly!');
      console.log(`Found ${response.data.data.length} records`);
    } else {
      console.log('❌ API Proxy returned an error');
    }
  } catch (error) {
    console.error('❌ Error testing API proxy:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testApiProxy();
