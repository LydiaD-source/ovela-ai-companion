import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ca from './locales/ca.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  ca: { translation: ca }
};

export const SUPPORTED_LANGS = ['en', 'es', 'fr', 'de', 'pt', 'ca'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

/**
 * URL-first language detector. Reads the first URL segment;
 * if it matches a supported language, returns it. Otherwise null.
 */
function detectFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  return seg && (SUPPORTED_LANGS as readonly string[]).includes(seg) ? seg : null;
}

// Custom URL detector — highest priority
const urlDetector = {
  name: 'urlPath',
  lookup: () => detectFromUrl() || undefined,
  cacheUserLanguage: () => {},
};

const detector = new LanguageDetector();
detector.addDetector(urlDetector as any);

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['urlPath', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
