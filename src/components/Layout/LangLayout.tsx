import { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from '@/i18n';

/**
 * Wraps language-prefixed routes. Reads :lang param, switches i18n
 * accordingly, and renders nested routes via <Outlet />.
 */
const LangLayout = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && (SUPPORTED_LANGS as readonly string[]).includes(lang) && i18n.language?.split('-')[0] !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <Outlet />;
};

export default LangLayout;
