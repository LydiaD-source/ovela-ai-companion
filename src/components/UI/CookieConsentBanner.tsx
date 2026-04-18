import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getConsent, setConsent } from '@/lib/analytics';

/**
 * GDPR-compliant cookie consent banner.
 * - Defaults GA4 consent to "denied" (Consent Mode v2)
 * - Loads analytics only after user accepts
 * - Localized in 6 languages (en, es, fr, de, pt, ca)
 */
export const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      // Slight delay so it doesn't block LCP
      const id = window.setTimeout(() => setVisible(true), 800);
      return () => window.clearTimeout(id);
    }
  }, []);

  if (!visible) return null;

  const handle = (choice: 'granted' | 'denied') => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('cookies.title', 'Cookie preferences')}
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 backdrop-blur-md border-t"
      style={{
        background: 'rgba(13, 13, 26, 0.95)',
        borderColor: 'rgba(212, 175, 55, 0.3)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
        <div className="flex-1 text-sm md:text-base" style={{ color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
          <p className="leading-relaxed">
            🍪 {t(
              'cookies.message',
              'We use cookies to analyze traffic and improve your experience. Analytics are loaded only with your consent.'
            )}{' '}
            <a
              href="/about"
              className="underline"
              style={{ color: '#E8CFA9' }}
            >
              {t('cookies.learnMore', 'Learn more')}
            </a>
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => handle('denied')}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-lg transition hover:opacity-80"
            style={{
              background: 'transparent',
              border: '1px solid rgba(232, 207, 169, 0.4)',
              color: '#E8CFA9',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {t('cookies.decline', 'Decline')}
          </button>
          <button
            onClick={() => handle('granted')}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-lg transition hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
              border: 'none',
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
            }}
          >
            {t('cookies.accept', 'Accept all')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
