// Add your API keys here
// For security, in a production environment, these should be environment variables

export const API_KEYS = {
  // OpenUV API key
  OPENUV_API_KEY: process.env.NEXT_PUBLIC_OPENUV_API_KEY || "openuv-cvlzrmbrttjbw-io", // User-provided OpenUV key
  // Autoderm API key
  AUTODERM_API_KEY: process.env.AUTODERM_API_KEY || "ddecf1fe-d679-77fb-52a4-28a89d71623a",
  // Keep OpenWeatherMap key for geocoding / pollution if desired (optional)
  OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "9b535cc211e5131904e753822f4f45a7",
  // World Air Quality Index (WAQI) token
  WAQI_API_TOKEN: process.env.NEXT_PUBLIC_WAQI_API_TOKEN || "cef12b67298c79b6ea937d61ae8fb3438f9ef83b",
} as const;
