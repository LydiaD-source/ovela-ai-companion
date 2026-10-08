import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { digitalSolutionsCopy } from '@/components/Home/SolutionsSection';
import { DIGITAL_CARD_PLANS } from '@/config/digitalCards';
import { useSEO } from '@/hooks/useSEO';
import overview from '@/assets/digital-cards/01-card-overview.png.asset.json';
import actions from '@/assets/digital-cards/actions.png.asset.json';
import film from '@/assets/digital-cards/film.png.asset.json';
import audience from '@/assets/digital-cards/audience-agency.png.asset.json';
import complete from '@/assets/digital-cards/00-complete-card.png.asset.json';
import { hostedAssetUrl } from '@/lib/hostedAssetUrl';
import { digitalCardEnquiryPath } from '@/config/digitalCardEnquiry';
import { DigitalCardBenefits } from '@/components/Home/DigitalCardBenefits';

const DigitalCards = () => {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const c = digitalSolutionsCopy[language as keyof typeof digitalSolutionsCopy] ?? digitalSolutionsCopy.en;
  const prefix = ['es', 'fr', 'de', 'pt', 'ca'].includes(language) ? `/${language}` : '';
  const [selected, setSelected] = useState<{ url: string; title: string } | null>(null);
  useSEO({ path: '/digital-cards', title: `Ovela Digital Cards | ${c[7]}`, description: c[9] });
  const screenshots = [
    { url: hostedAssetUrl(actions), title: 'Contact & sharing' },
    { url: hostedAssetUrl(audience), title: 'Professional introduction' },
    { url: hostedAssetUrl(film), title: 'Featured presentation' },
  ];
  return (
    <div className="min-h-screen bg-solution px-6 pb-16 pt-28 text-solution-foreground">
      <div className="mx-auto max-w-6xl">
        <Button asChild variant="link" className="mb-8 px-0 text-solution-muted"><Link to={`${prefix}/#solutions`}><ArrowLeft /> Ovela / {c[0]}</Link></Button>
        <header className="max-w-3xl">
          <p className="mb-3 text-xs uppercase text-solution-gold">Ovela Interactive</p>
          <h1 className="font-playfair text-4xl leading-tight md:text-5xl">Ovela Digital Card</h1>
          <h2 className="mt-4 font-playfair text-2xl text-solution-gold">{c[7]}</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-solution-muted">{c[9]}</p>
          <p className="mt-4 text-solution-gold">{c[8]}</p>
        </header>
        <div className="my-10 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <figure className="min-w-0">
            <Button variant="ghost" className="h-auto w-full overflow-hidden rounded-lg border border-solution-border bg-solution-surface p-0 hover:bg-solution-surface" onClick={() => setSelected({ url: hostedAssetUrl(complete), title: 'Complete demo card' })} aria-label="View complete demo card">
              <img src={hostedAssetUrl(overview)} alt="Fictional Dario Engler Digital Card profile and contact actions" className="max-h-[640px] w-full object-contain object-top" />
            </Button>
            <figcaption className="mt-3 flex items-center justify-between gap-3 text-xs text-solution-muted"><span>Dario Engler · Fictional demo</span><Button variant="link" className="h-auto p-0 text-xs text-solution-gold" onClick={() => setSelected({ url: hostedAssetUrl(complete), title: 'Complete demo card' })}>Full card <Expand /></Button></figcaption>
          </figure>
          <section id="plans" className="min-w-0 scroll-mt-24">
            <h2 className="mb-4 font-playfair text-3xl">{c[14]}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {DIGITAL_CARD_PLANS.map(plan => <article key={plan.id} className={`flex min-w-0 flex-col rounded-lg border bg-solution-surface p-5 ${plan.id === 'pro' ? 'border-solution-gold/50' : 'border-solution-border'}`}>
                <h3 className="text-lg font-medium">{plan.name}</h3>
                <p className="mt-4"><strong className="font-playfair text-4xl text-solution-gold">€{plan.monthlyPrice}</strong><span className="text-sm text-solution-muted">/{c[25]}</span></p>
                <p className="mb-6 mt-1 text-sm text-solution-muted">€{plan.yearlyPrice}/{c[26]} · per person</p>
                <ul className="mb-6 space-y-3 text-sm text-solution-muted">{(plan.id === 'basic' ? [c[15], c[16], c[17], `${plan.profileUpdatesPerMonth} ${c[18]}`] : [c[19], `≤ ${plan.smartUpdatesPerMonth} ${c[20]}`, c[21], c[22]]).map(item => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-solution-gold" /><span>{item}</span></li>)}</ul>
                <Button asChild variant="outline" className="mt-auto h-auto whitespace-normal border-solution-gold/50 bg-transparent py-3 text-solution-gold hover:bg-solution-gold hover:text-solution"><Link to={digitalCardEnquiryPath(prefix, plan.id)}>{c[23]} <ArrowRight /></Link></Button>
              </article>)}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-solution-muted">Demo screenshots show the existing card. Contact details are fictional; the concierge uses prewritten replies. Smart Updates are planned Pro features, not demonstrated or live in this demo.</p>
          </section>
        </div>
        <DigitalCardBenefits />
        <section className="border-t border-solution-border pt-8">
          <h2 className="mb-6 font-playfair text-3xl">More than a business card</h2>
          <div className="grid items-start gap-5 md:grid-cols-3">{screenshots.map(image => <figure key={image.title}>
            <Button variant="ghost" className="h-auto w-full overflow-hidden rounded-lg border border-solution-border p-0 hover:bg-solution-surface" onClick={() => setSelected(image)} aria-label={`View ${image.title}`}><img src={image.url} alt={`Ovela demo card — ${image.title}`} className="w-full" loading="lazy" /></Button>
            <figcaption className="mt-3 text-sm text-solution-muted">{image.title}</figcaption>
          </figure>)}</div>
        </section>
        <footer className="mt-12 border-t border-solution-border pt-6 text-sm text-solution-muted">Powered by Ovela Interactive.</footer>
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="solution-dialog w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-lg border-solution-border bg-solution text-solution-foreground">
          <DialogTitle className="pr-6 tracking-normal">{selected?.title}</DialogTitle>
          <DialogDescription className="text-solution-muted">Ovela Digital Card · Fictional product demo</DialogDescription>
          {selected && <img src={selected.url} alt={selected.title} className="mx-auto h-auto w-full max-w-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default DigitalCards;