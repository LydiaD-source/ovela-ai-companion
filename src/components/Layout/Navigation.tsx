import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { cardComparisonPath, getCardFirstCopy, localizedPrefix, IIPE_PARTNER_URL } from '@/config/cardFirstSite';
import logo from '@/assets/ovela-logo-corrected.png';
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const prefix = localizedPrefix(i18n.language);
  const c = getCardFirstCopy(i18n.language);
  const navItems = [
    { name: 'Ovela Digital Cards', path: `${prefix}/digital-cards` },
    { name: c.solutions, path: `${prefix}/solutions` },
    { name: t('nav.about'), path: `${prefix}/about` },
    { name: t('nav.contact'), path: `${prefix}/contact` },
  ];
  useEffect(() => { setIsOpen(false); }, [location]);
  useEffect(() => {
    const outside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    if (isOpen) { document.addEventListener('mousedown', outside); document.addEventListener('keydown', escape); }
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [isOpen]);
  return <nav aria-label="Main navigation" className={`fixed top-0 w-full border-b border-solution-border bg-solution/95 text-solution-foreground backdrop-blur-md ${isOpen ? 'z-[110]' : 'z-50'}`}>
    <div ref={dropdownRef} className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-5 py-3 md:px-8">
      <Link to={`${prefix}/`} aria-label="Ovela Interactive home"><img src={logo} alt="Ovela Interactive" className="h-10 w-36 object-contain object-left" decoding="async" /></Link>
      <div className="flex items-center gap-2"><Button asChild className="card-primary-action hidden sm:inline-flex"><Link to={cardComparisonPath(prefix)}>{c.get}</Link></Button><LanguageSwitcher /><Button variant="ghost" size="icon" className="text-solution-foreground hover:bg-solution-surface hover:text-solution-gold [&_svg]:size-6" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" aria-expanded={isOpen} aria-controls="navigation-menu">{isOpen ? <X /> : <Menu />}</Button></div>
      {isOpen && <div id="navigation-menu" className="solution-menu fixed right-4 top-16 w-80 max-w-[calc(100%-2rem)] overflow-y-auto rounded-lg border border-solution-border bg-solution p-5 md:right-8">
        <div className="flex flex-col">{navItems.map(item => <Button key={item.path} asChild variant="link" className="h-auto justify-start whitespace-normal border-b border-solution-border px-0 py-4 text-left text-lg text-solution-foreground"><Link to={item.path}>{item.name}</Link></Button>)}<Button asChild variant="link" className="h-auto justify-between px-0 py-4 text-solution-cyan"><a href={IIPE_PARTNER_URL} target="_blank" rel="noopener noreferrer">IIPE<ArrowUpRight /></a></Button></div>
        <Button asChild className="card-primary-action mt-3 h-auto w-full whitespace-normal py-3"><Link to={cardComparisonPath(prefix)}>{c.get}</Link></Button>
      </div>}
    </div>
  </nav>;
};
export default Navigation;
