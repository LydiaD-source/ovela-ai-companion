// GA4 with Consent Mode v2 — gated by cookie banner
// Loads gtag only after user accepts; events queued until then are silently dropped.

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    __GA4_LOADED__?: boolean;
  }
}

// GA4 Measurement ID for Ovela Interactive
export const GA_MEASUREMENT_ID = 'G-W1DLW2R7D7';
const CONSENT_KEY = 'ovela_cookie_consent';

type Consent = 'granted' | 'denied' | null;

export const getConsent = (): Consent => {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem(CONSENT_KEY) as Consent) || null;
};

export const setConsent = (value: 'granted' | 'denied') => {
  localStorage.setItem(CONSENT_KEY, value);
  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    });
  }
  if (value === 'granted') loadGA4();
};

export const initConsentMode = () => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };
  // Default DENIED until user accepts (GDPR-compliant)
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });
  window.gtag('js', new Date());

  // If user already accepted in a prior session, load GA4 + flip consent.
  if (getConsent() === 'granted') {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    loadGA4();
  }
};

export const loadGA4 = () => {
  if (typeof window === 'undefined' || window.__GA4_LOADED__) return;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.info('[Analytics] GA4 Measurement ID not set — skipping load.');
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  window.__GA4_LOADED__ = true;
};

// Conversion event helper — safe to call anytime; no-op if consent denied.
export const trackEvent = (
  eventName: string,
  params: Record<string, any> = {}
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (getConsent() !== 'granted') return;
  window.gtag('event', eventName, params);
};

// Predefined conversion events (mirrors Wellnespirit setup)
export const trackBookClick = (location: string) =>
  trackEvent('book_click', { location });
export const trackIsabellaClick = (location: string) =>
  trackEvent('isabella_engage', { location });
export const trackSolutionClick = (solution: string) =>
  trackEvent('solution_click', { solution });
export const trackProductClick = (product: string) =>
  trackEvent('product_click', { product });
export const trackPartnershipClick = (location: string) =>
  trackEvent('partnership_click', { location });
