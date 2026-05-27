import { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from '@/i18n';

const LangLayout = () => {
  const params = useParams();
  // Lang is determined by the route prefix itself; we extract it from the URL path
  const lang = typeof window !== 'undefined'
    ? window.location.pathname.split('/').filter(Boolean)[0]
    : 'en';
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && (SUPPORTED_LANGS as readonly string[]).includes(lang) && i18n.language?.split('-')[0] !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n, params]);

  return <Outlet />;
};

export default LangLayout;
