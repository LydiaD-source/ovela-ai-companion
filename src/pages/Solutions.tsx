import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AboutSection } from '@/components/Home/AboutSection';
import { LookbookCarousel } from '@/components/Home/LookbookCarousel';
import { ShowcaseSection } from '@/components/Home/ShowcaseSection';
import { AssessmentsSection } from '@/components/Home/AssessmentsSection';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { openIsabella } from '@/components/Isabella/IsabellaDock';
import { getCardFirstCopy, localizedPrefix } from '@/config/cardFirstSite';
import { useSEO } from '@/hooks/useSEO';
import { trackEvent } from '@/lib/analytics';
export default function Solutions() {
  const { i18n } = useTranslation();
  const c = getCardFirstCopy(i18n.language);
  const prefix = localizedPrefix(i18n.language);
  useSEO({ path: '/solutions' });
  useEffect(() => { trackEvent('solutions_view'); }, []);
  return <div className="bg-solution text-solution-foreground">
    <header className="mx-auto max-w-6xl px-6 pb-12 pt-32"><p className="mb-4 text-xs text-solution-gold">OVELA INTERACTIVE / SOLUTIONS</p><h1 className="max-w-3xl font-playfair text-4xl leading-tight md:text-5xl">{c.solutionsTitle}</h1><p className="mb-6 mt-5 max-w-2xl leading-relaxed text-solution-muted">{c.solutionsIntro}</p><div className="flex flex-wrap gap-5">{[{ title: i18n.language.startsWith('en') ? 'Digital Employees' : c.more, hash: 'meet-team' }, { title: c.tools, hash: 'tools' }, { title: c.projects, hash: 'applications' }].map(item => <Button key={item.hash} asChild variant="link" className="h-auto px-0 text-solution-gold"><a href={`#${item.hash}`}>{item.title}<ArrowRight /></a></Button>)}</div></header>
    <AboutSection onChatClick={() => openIsabella()} />
    <LookbookCarousel />
    <section id="tools" className="scroll-mt-20"><h2 className="mx-auto max-w-6xl px-6 pt-12 font-playfair text-3xl">{c.tools}</h2><AssessmentsSection onLaunch={openIsabella} /></section>
    <section id="applications" className="scroll-mt-20"><h2 className="mx-auto max-w-6xl px-6 py-10 font-playfair text-3xl">{c.projects}</h2><ShowcaseSection /></section>
    <div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-6 py-10">{['projects', 'pricing', 'industries/clinics', 'industries/real-estate', 'industries/wellness'].map(path => <Button key={path} asChild variant="link" className="text-solution-gold"><Link to={`${prefix}/${path}`}>{path.split('/').pop()?.replace(/-/g, ' ')}<ArrowRight /></Link></Button>)}</div>
    <FooterMinimal />
  </div>;
}
