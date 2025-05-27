// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
    
    // Skin Analysis
    ANALYSIS: {
      ANALYZE: '/analyze',
      HISTORY: '/analysis/history',
      RESULT: (id: string) => `/analysis/${id}`,
      DELETE: (id: string) => `/analysis/${id}`,
    },
    
    // User Profile
    USER: {
      PROFILE: '/user/profile',
      PREFERENCES: '/user/preferences',
    },
  },
  
  // Default request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Maximum number of retries for failed requests
  MAX_RETRIES: 3,
  
  // Delay between retries in milliseconds
  RETRY_DELAY: 1000,
} as const;

// Application Configuration
export const APP_CONFIG = {
  // Application name
  NAME: 'Derm AI',
  
  // Application description
  DESCRIPTION: 'AI-powered skin analysis for better skin health',
  
  // Version
  VERSION: '1.0.0',
  
  // Environment
  ENV: process.env.NODE_ENV || 'development',
  
  // Is production environment
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Is development environment
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Is test environment
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // Default theme
  DEFAULT_THEME: 'system' as const,
  
  // Supported themes
  THEMES: ['light', 'dark', 'system'] as const,
  
  // Default language
  DEFAULT_LANGUAGE: 'en',
  
  // Supported languages
  LANGUAGES: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ] as const,
  
  // Default date format
  DATE_FORMAT: 'MMM d, yyyy',
  
  // Default time format
  TIME_FORMAT: 'h:mm a',
  
  // Default date-time format
  DATE_TIME_FORMAT: 'MMM d, yyyy h:mm a',
  
  // Maximum file size for uploads (5MB)
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024,
  
  // Supported image file types
  SUPPORTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,
  
  // Maximum number of recent analyses to show
  MAX_RECENT_ANALYSES: 10,
  
  // Maximum number of history items to load at once
  HISTORY_PAGE_SIZE: 20,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  // Enable/disable authentication
  AUTH_ENABLED: true,
  
  // Enable/disable user registration
  REGISTRATION_ENABLED: true,
  
  // Enable/disable social login
  SOCIAL_LOGIN_ENABLED: true,
  
  // Enable/disable offline mode
  OFFLINE_MODE: false,
  
  // Enable/disable analytics
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  
  // Enable/disable error tracking
  ERROR_TRACKING_ENABLED: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === 'true',
  
  // Enable/disable performance monitoring
  PERFORMANCE_MONITORING_ENABLED: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED === 'true',
} as const;

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Google Analytics
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
  
  // Hotjar
  HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
  HOTJAR_SNIPPET_VERSION: process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION || '6',
  
  // Sentry
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // LogRocket
  LOGROCKET_APP_ID: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || '',
} as const;

// Export all configs
export default {
  API: API_CONFIG,
  APP: APP_CONFIG,
  FEATURES: FEATURE_FLAGS,
  ANALYTICS: ANALYTICS_CONFIG,
};
