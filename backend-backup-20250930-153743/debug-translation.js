const axios = require('axios');
const crypto = require('crypto');

async function debugTranslation() {
  try {
    console.log('🔍 Debugging translation system...');
    
    // Test the translation API
    const key = 'nav.dashboard';
    const langCode = 'en';
    
    console.log(`Testing translation for key: ${key}, language: ${langCode}`);
    
    const response = await axios.get(`http://localhost:3001/api/translations/translate/${encodeURIComponent(key)}`, {
      headers: {
        'X-Language-Code': langCode
      }
    });
    
    console.log('Translation API response:', response.data);
    
    // Test the languages endpoint
    const languagesResponse = await axios.get('http://localhost:3001/api/translations/languages');
    console.log('Languages:', languagesResponse.data);
    
    // Test getting translations for a language
    try {
      const translationsResponse = await axios.get(`http://localhost:3001/api/translations/languages/${langCode}/translations`);
      console.log('Translations for en:', translationsResponse.data);
    } catch (error) {
      console.error('Error getting translations:', error.response?.data || error.message);
    }
    
    // Test MD5 hashing
    const keyHash = crypto.createHash('md5').update(key).digest('hex');
    console.log(`MD5 hash for "${key}": ${keyHash}`);
    
  } catch (error) {
    console.error('Debug error:', error.response?.data || error.message);
  }
}

debugTranslation();
