import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpRight, Share2, RefreshCw, Contact, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardFirstHero } from '@/components/Home/CardFirstHero';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { DIGITAL_CARD_PLANS } from '@/config/digitalCards';
import { digitalCardEnquiryPath } from '@/config/digitalCardEnquiry';
import { getCardFirstCopy, localizedPrefix, IIPE_PARTNER_URL } from '@/config/cardFirstSite';
import { digitalSolutionsCopy } from '@/components/Home/SolutionsSection';
import { useSEO } from '@/hooks/useSEO';
import { trackEvent } from '@/lib/analytics';
const Home = () => {
  const { i18n } = useTranslation();
  const c = getCardFirstCopy(i18n.language);
  const prefix = localizedPrefix(i18n.language);
  const pricing = digitalSolutionsCopy[i18n.language.split('-')[0] as keyof typeof digitalSolutionsCopy] ?? digitalSolutionsCopy.en;
  useSEO({ path: '/' });
  return <div className="bg-solution text-solution-foreground">
    <CardFirstHero />
    <section className="border-y border-solution-border px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-9 font-playfair text-3xl md:text-4xl">{c.current}</h2>
        <div className="grid gap-8 md:grid-cols-3">{[{ icon: Share2, title: c.share, text: c.shareText }, { icon: RefreshCw, title: c.update, text: c.updateText }, { icon: Contact, title: c.connect, text: c.connectText }].map(({ icon: Icon, title, text }, index) => <div key={title}><div className="mb-4 flex items-center gap-3 text-solution-gold"><span className="text-xs">0{index + 1}</span><Icon className="h-5 w-5" /></div><h3 className="mb-3 text-lg font-medium">{title}</h3><p className="max-w-sm text-sm leading-relaxed text-solution-muted">{text}</p></div>)}</div>
      </div>
    </section>
    <section id="digital-cards" className="scroll-mt-24 px-6 py-14 md:py-16">
      <div className="mx-auto max-w-6xl"><h2 className="mb-8 font-playfair text-3xl md:text-4xl">{c.plans}</h2>
        <div className="grid gap-5 md:grid-cols-2">{DIGITAL_CARD_PLANS.map(plan => <article key={plan.id} className={`rounded-lg border bg-solution-surface p-7 ${plan.id === 'pro' ? 'border-solution-gold/60' : 'border-solution-border'}`}>
          <div className="flex flex-wrap items-start justify-between gap-4"><h3 className="text-xl">{plan.name}</h3><p><strong className="font-playfair text-4xl text-solution-gold">€{plan.monthlyPrice}</strong><span className="text-sm text-solution-muted">/{pricing[25]}</span></p></div>
          <p className="mt-1 text-right text-xs text-solution-muted">€{plan.yearlyPrice}/{pricing[26]} · {i18n.language.startsWith('en') ? 'per person' : '1'}</p>
          <p className="my-6 max-w-md text-sm leading-relaxed text-solution-muted">{plan.id === 'pro' ? c.pro : c.basic}</p>
          <Button asChild variant="link" className="h-auto whitespace-normal px-0 text-solution-gold"><Link to={digitalCardEnquiryPath(prefix, plan.id)} onClick={() => trackEvent('card_plan_enquiry_click', { plan: plan.id, location: 'home' })}>{c.get}<ArrowRight /></Link></Button>
        </article>)}</div>
        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-solution-muted">{i18n.language.startsWith('en') ? 'Pro Smart Updates, push notifications and analytics are planned for delivery, not demonstrated in this preview. Our team confirms availability and delivery details.' : pricing[9]}</p>
        <Button asChild variant="link" className="mt-4 h-auto px-0 text-solution-gold"><Link to={`${prefix}/digital-cards#plans`}>{pricing[29]}<ArrowRight /></Link></Button>
      </div>
    </section>
    <section className="border-y border-solution-border px-6 py-8"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6"><h2 className="text-sm text-solution-muted">{c.uses}</h2><ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">{c.useItems.map(item => <li key={item}>{item}</li>)}</ul></div></section>
    <section id="solutions" className="scroll-mt-24 px-6 py-14"><div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1fr_1.3fr]"><h2 className="font-playfair text-3xl md:text-4xl">{c.more}</h2><div><p className="max-w-xl text-base leading-relaxed text-solution-muted">{c.moreText}</p><Button asChild variant="link" className="mt-5 h-auto px-0 text-solution-gold"><Link to={`${prefix}/solutions`}>{c.solutions}<ArrowRight /></Link></Button></div></div></section>
    <section id="iipe" className="border-t border-solution-border px-6 py-12"><div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-[1fr_1.3fr]"><div className="flex items-center gap-4 text-solution-cyan"><Globe2 className="h-10 w-10" strokeWidth={1} /><h2 className="font-playfair text-4xl">IIPE</h2></div><div><h3 className="mb-3 text-lg">{c.built}</h3><p className="max-w-xl text-sm leading-relaxed text-solution-muted">{c.iipe}</p><Button asChild variant="link" className="mt-4 h-auto px-0 text-solution-cyan"><a href={IIPE_PARTNER_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('iipe_partner_click', { location: 'home' })}>{c.visit}<ArrowUpRight /></a></Button></div></div></section>
    <FooterMinimal />
  </div>;
};
export default Home;
