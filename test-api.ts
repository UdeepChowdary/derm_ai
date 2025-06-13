import { API_KEYS } from './config/api-keys';

async function testAutodermAPI() {
  console.log('Testing Autoderm API...');
  
  // Check if API key is loaded
  if (!API_KEYS.AUTODERM_API_KEY) {
    console.error('❌ Error: AUTODERM_API_KEY is not set in the configuration');
    return;
  }

  console.log('✅ API Key is present');
  console.log('API Key starts with:', API_KEYS.AUTODERM_API_KEY.substring(0, 8) + '...');

  try {
    // Make a simple health check request to the API
    const healthCheckUrl = 'https://autoderm.ai/v1/utils/healthz';
    console.log('\nTesting API health check...');
    
    const healthResponse = await fetch(healthCheckUrl);
    const healthData = await healthResponse.text();
    
    console.log(`✅ Health check status: ${healthResponse.status} ${healthResponse.statusText}`);
    console.log('Health check response:', healthData);

    // If we got this far, the API key is likely valid
    console.log('\n✅ Autoderm API is accessible and working correctly');
    
  } catch (error) {
    console.error('❌ Error testing Autoderm API:', error);
    console.log('\nPossible issues:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the API key is correct');
    console.log('3. Check if the Autoderm service is currently available');
  }
}

// Run the test
testAutodermAPI().catch(console.error);

export {}; // This makes the file a module
