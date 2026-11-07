/**
 * API Configuration
 * 
 * Server-side API keys and endpoints used in proxy routes (/api/analyze, /api/uv).
 * Secret keys must never be exposed to the client bundle without a backend proxy.
 */

// API Keys and Configuration
export const API_KEYS = {
  // OpenUV API key for UV index data
  OPENUV_API_KEY: process.env.OPENUV_API_KEY || process.env.NEXT_PUBLIC_OPENUV_API_KEY || '',
  
  // Autoderm API key for skin analysis
  AUTODERM_API_KEY: process.env.AUTODERM_API_KEY || process.env.NEXT_PUBLIC_AUTODERM_API_KEY || '',
  
  // OpenWeatherMap API key for weather data
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '',
  
  // World Air Quality Index API token
  WAQI_API_TOKEN: process.env.WAQI_API_TOKEN || process.env.NEXT_PUBLIC_WAQI_API_TOKEN || '',
  
  // API Endpoints
  ENDPOINTS: {
    AUTODERM: process.env.AUTODERM_API_URL || process.env.NEXT_PUBLIC_AUTODERM_API_URL || 'https://autoderm.ai/v1/query',
    OPENUV: process.env.OPENUV_API_URL || process.env.NEXT_PUBLIC_OPENUV_API_URL || 'https://api.openuv.io/api/v1',
    OPENWEATHER: process.env.OPENWEATHER_API_URL || process.env.NEXT_PUBLIC_OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
    WAQI: process.env.WAQI_API_URL || process.env.NEXT_PUBLIC_WAQI_API_URL || 'https://api.waqi.info/feed'
  }
} as const;
