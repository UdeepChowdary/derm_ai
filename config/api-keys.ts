// Add your API keys here
// For security, in a production environment, these should be environment variables

export const API_KEYS = {
  // OpenWeatherMap API key
  OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "", // Use NEXT_PUBLIC_ prefix for client-side access
  // Autoderm API key
  AUTODERM_API_KEY: process.env.AUTODERM_API_KEY || "8ab3a40f-c956-c332-521d-f8e13b46042d"
  // Using only free APIs that don't require registration
} as const;
