import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import './i18n';
import { initConsentMode } from './lib/analytics';
import { trackAppLaunch } from './lib/usageBeacon';

initConsentMode();
// Server-side usage beacon for WellnessGeni admin tracking (consent-independent,
// no cookies or personal data — one event per browser session).
trackAppLaunch();

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
