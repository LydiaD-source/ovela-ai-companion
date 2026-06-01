import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'https://www.ovelainteractive.com';
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'ca'] as const;
const LOCALE_MAP: Record<string, string> = {
  en: 'en_US', es: 'es_ES', fr: 'fr_FR', de: 'de_DE', pt: 'pt_BR', ca: 'ca_ES',
};

interface SEOProps {
  /** Path WITHOUT language prefix, e.g. "/about", "/videos/some-slug", "/" */
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video.other';
  /** Optional JSON-LD schema(s) to inject */
  schema?: object | object[];
  /** noindex (e.g. duplicate language variants if desired) */
  noindex?: boolean;
  /**
   * If true, canonical always points to the English (no-prefix) URL and no
   * hreflang alternates are emitted. Use for pages whose content is not
   * actually translated per language (e.g. video detail pages) so Google
   * consolidates ranking signals onto one URL instead of treating the
   * /fr, /es, /ca variants as thin duplicates.
   */
  singleCanonical?: boolean;
}

function buildUrl(lang: string, path: string): string {
  const cleanPath = path === '/' ? '' : path;
  const prefix = lang === 'en' ? '' : `/${lang}`;
  return `${BASE_URL}${prefix}${cleanPath || (prefix ? '' : '/')}`;
}

export const SEO: React.FC<SEOProps> = ({
  path,
  title,
  description,
  ogImage = 'https://www.ovelainteractive.com/images/isabella-hero-native.png',
  ogType = 'website',
  schema,
  noindex,
  singleCanonical,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] || 'en') as typeof SUPPORTED_LANGUAGES[number];
  const canonicalUrl = singleCanonical ? buildUrl('en', path) : buildUrl(currentLang, path);
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <link rel="canonical" href={canonicalUrl} />

      {/* hreflang alternates — only when the page is genuinely translated. */}
      {!singleCanonical && SUPPORTED_LANGUAGES.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={buildUrl(lang, path)} />
      ))}
      {!singleCanonical && (
        <link rel="alternate" hrefLang="x-default" href={buildUrl('en', path)} />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Ovela Interactive" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={LOCALE_MAP[currentLang] || 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
