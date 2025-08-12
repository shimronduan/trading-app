// Test script to verify Azure endpoint connection
const axios = require('axios');

const baseURL = 'https://trading-bot-app-v3.azurewebsites.net/api';
const apiKey = 'YWIqVJodrU_rR4jCAft_anUrP9A2pdL8ekFtmcUE0fmsAzFuK_6MFg==';

async function testAzureEndpoint() {
  try {
    console.log('Testing Azure endpoint connection...');
    console.log('URL:', `${baseURL}/tp_sl?code=${apiKey}`);
    
    const response = await axios.get(`${baseURL}/tp_sl?code=${apiKey}`);
    
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.records) {
      console.log('\n✅ Connection successful!');
      console.log(`Found ${response.data.count} records:`);
      
      response.data.records.forEach((record, index) => {
        console.log(`${index + 1}. Row ${record.RowKey} (${record.PartitionKey}): ATR ${record.atr_multiple}, Close ${record.close_fraction}%`);
      });
    } else {
      console.log('❌ Unexpected response format');
    }
  } catch (error) {
    console.error('❌ Error connecting to Azure endpoint:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response:', error.response?.data);
  }
}

testAzureEndpoint();
