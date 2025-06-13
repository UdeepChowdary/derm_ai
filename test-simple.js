// Simple test to verify API key and basic functionality
const fs = require('fs');
const path = require('path');

// Hardcoded API key
const apiKey = '0e1607c3-cab4-7818-7b81-8d47a9b61d77';

console.log('\n=== Testing API Configuration ===');
console.log('API Key present:', apiKey ? '✅ Yes' : '❌ No');
if (apiKey) {
  console.log('Key starts with:', apiKey.substring(0, 4) + '...');
}

// Simple fetch test
async function testApi() {
  try {
    console.log('\n=== Testing API Connection ===');
    const response = await fetch('https://autoderm.ai/v1/utils/healthz');
    const data = await response.text();
    console.log('API Status:', response.status, response.statusText);
    console.log('Response:', data);
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

// Run the test
testApi().catch(console.error);
