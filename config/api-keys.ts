/**
 * API Configuration
 * 
 * This file contains all API keys and endpoints used in the application.
 * WARNING: In a production environment, these values should be stored in environment variables.
 */

// API Keys and Configuration
export const API_KEYS = {
  // OpenUV API key for UV index data
  OPENUV_API_KEY: 'your_openuv_key_here',
  
  // Autoderm API key for skin analysis
  AUTODERM_API_KEY: '0e1607c3-cab4-7818-7b81-8d47a9b61d77',
  
  // OpenWeatherMap API key for weather data
  OPENWEATHER_API_KEY: 'your_openweather_key_here',
  
  // World Air Quality Index API token
  WAQI_API_TOKEN: 'your_waqi_token_here',
  
  // API Endpoints
  ENDPOINTS: {
    AUTODERM: 'https://autoderm.ai/v1/query',
    OPENUV: 'https://api.openuv.io/api/v1',
    OPENWEATHER: 'https://api.openweathermap.org/data/2.5',
    WAQI: 'https://api.waqi.info/feed'
  }
} as const;
