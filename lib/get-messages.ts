// Function to load messages for a given locale
export async function getMessages(locale: string) {
  try {
    return (await import(`../messages/${locale}/index.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to English if the requested locale is not available
    return (await import('../messages/en/index.json')).default;
  }
}
