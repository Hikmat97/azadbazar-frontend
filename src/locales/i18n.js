import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import da from './da/translation.json';
import en from './en/translation.json';
import ps from './ps/translation.json';

const LANGUAGE_KEY = '@app_language';

// Get stored language
const getStoredLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return language || 'da';
  } catch (error) {
    console.error('Error getting language:', error);
    return 'en';
  }
};

// Save language
export const setLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Initialize i18next
const initI18n = async () => {
  const savedLanguage = await getStoredLanguage();

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources: {
        en: { translation: en },
        da: { translation: da },
        ps: { translation: ps }
      },
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
};

initI18n();

export default i18n;