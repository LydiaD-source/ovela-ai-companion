import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Primary domain - use non-www as canonical (with 301 redirects from www)
const BASE_URL = 'https://ovelainteractive.com';

// Supported languages for hreflang
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt'] as const;

interface SEOConfig {
  path: string;
  title?: string;
  description?: string;
}

/**
 * Comprehensive SEO hook for multilingual support
 * - Sets canonical URL (self-referencing for current language)
 * - Adds hreflang tags for all supported languages
 * - Updates html lang attribute
 * - Updates Open Graph URL
 */
export const useSEO = ({ path, title, description }: SEOConfig) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'en'; // Normalize 'en-US' to 'en'

  useEffect(() => {
    // Normalize path (ensure no trailing slash except homepage)
    const normalizedPath = path === '/' ? '' : path;
    const pageUrl = `${BASE_URL}${normalizedPath}`;

    // 1. Update HTML lang attribute
    document.documentElement.lang = currentLang;

    // 2. Update or create canonical link (self-referencing)
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = pageUrl;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = pageUrl;
      document.head.appendChild(canonical);
    }

    // 3. Update Open Graph URL
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (ogUrl) {
      ogUrl.content = pageUrl;
    } else {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      ogUrl.content = pageUrl;
      document.head.appendChild(ogUrl);
    }

    // 4. Update Open Graph locale
    let ogLocale = document.querySelector('meta[property="og:locale"]') as HTMLMetaElement;
    const localeMap: Record<string, string> = {
      en: 'en_US',
      es: 'es_ES',
      fr: 'fr_FR',
      de: 'de_DE',
      pt: 'pt_BR',
    };
    if (ogLocale) {
      ogLocale.content = localeMap[currentLang] || 'en_US';
    } else {
      ogLocale = document.createElement('meta');
      ogLocale.setAttribute('property', 'og:locale');
      ogLocale.content = localeMap[currentLang] || 'en_US';
      document.head.appendChild(ogLocale);
    }

    // 5. Remove old hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // 6. Add hreflang tags for all supported languages
    SUPPORTED_LANGUAGES.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = pageUrl; // Same URL - language is handled client-side
      document.head.appendChild(link);
    });

    // 7. Add x-default hreflang (points to default/English version)
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = pageUrl;
    document.head.appendChild(xDefault);

    // 8. Update title if provided
    if (title) {
      document.title = title;
    }

    // 9. Update meta description if provided
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (metaDesc) {
        metaDesc.content = description;
      } else {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        metaDesc.content = description;
        document.head.appendChild(metaDesc);
      }
    }

    // Cleanup on unmount
    return () => {
      // Remove hreflang tags when navigating away
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    };
  }, [path, currentLang, title, description]);
};

/**
 * Simple canonical hook for backwards compatibility
 * Now uses the comprehensive SEO hook internally
 */
export const useCanonicalLink = (path: string) => {
  useSEO({ path });
};
