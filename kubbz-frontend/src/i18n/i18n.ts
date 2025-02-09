import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './en.json';
import deTranslations from './de.json';
import itTranslations from './it.json';
import frTranslations from './fr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      de: { translation: deTranslations },
      it: { translation: itTranslations },
      fr: { translation: frTranslations },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
