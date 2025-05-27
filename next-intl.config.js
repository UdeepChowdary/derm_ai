// next-intl.config.js
module.exports = {
  // Define the list of all locales that are supported
  locales: ['en', 'es', 'fr'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Set to true for localized pathnames (e.g., /en/blog, /fr/blog)
  localePrefix: 'always',
  
  // Define the domain for each locale
  domains: undefined,
  
  // Defines which locales are available in which pathnames
  pathnames: {
    // Pathname for home
    '/': '/',
    '/home': '/home',
    '/scan': '/scan',
    '/upload': '/upload',
    '/settings': '/settings',
    '/history': '/history',
    '/report/[id]': '/report/[id]',
  },
};
