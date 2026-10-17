import overview from '@/assets/digital-cards/01-card-overview.png.asset.json';
import { hostedAssetUrl } from '@/lib/hostedAssetUrl';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardComparisonPath, getCardFirstCopy, localizedPrefix } from '@/config/cardFirstSite';
import { trackEvent } from '@/lib/analytics';
export function CardFirstHero() {
  const { i18n } = useTranslation();
  const c = getCardFirstCopy(i18n.language);
  const prefix = localizedPrefix(i18n.language);
  return <section className="card-first-hero">
    <div className="card-hero-copy">
      <p className="mb-5 text-xs text-solution-gold">OVELA INTERACTIVE / OVELA DIGITAL CARDS</p>
      <h1 className="max-w-2xl font-playfair text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">{c.headline}</h1>
      <p className="mb-8 mt-6 max-w-xl text-base leading-relaxed text-solution-muted md:text-lg">{c.intro}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild className="card-primary-action h-auto min-h-12 whitespace-normal px-6 py-3"><Link to={cardComparisonPath(prefix)} onClick={() => trackEvent('card_compare_click', { location: 'home_hero' })}>{c.get}<ArrowRight className="shrink-0" /></Link></Button>
        <Button asChild variant="link" className="h-auto whitespace-normal px-0 py-3 text-solution-foreground"><Link to={`${prefix}/solutions`}>{c.solutions}<ArrowRight className="shrink-0" /></Link></Button>
      </div>
    </div>
    <div className="card-hero-product">
      <div className="product-phone">
        <div className="phone-camera" aria-hidden="true" />
        <img src={hostedAssetUrl(overview)} alt="Ovela Digital Card — fictional Dario Engler profile and contact actions" className="phone-screen" fetchPriority="high" decoding="async" />
      </div>
      <p className="mt-5 text-center text-xs text-solution-muted">Ovela Digital Card / Dario Engler · Demo</p>
    </div>
  </section>;
}
