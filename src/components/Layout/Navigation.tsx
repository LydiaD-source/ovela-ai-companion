import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const location = useLocation();

  const lang = t('languageCode', { defaultValue: '' }) || (typeof window !== 'undefined' ? (window.location.pathname.split('/').filter(Boolean)[0] || '') : '');
  const langPrefix = ['fr', 'es', 'de', 'pt', 'ca'].includes(lang) ? `/${lang}` : '';

  const navItems = [
    { name: t('nav.home'), path: `${langPrefix}/` || '/' },
    { name: t('nav.about'), path: `${langPrefix}/about` },
    { name: t('nav.pricing'), path: `${langPrefix}/pricing` },
    { name: t('nav.projects'), path: `${langPrefix}/projects` },
    { name: t('nav.partner'), path: `${langPrefix}/partner` },
    { name: t('nav.videos', { defaultValue: 'Videos' }), path: `${langPrefix}/videos` },
    { name: t('nav.contact'), path: `${langPrefix}/contact` },
  ];

  const solutionLabels: Record<string, string[]> = {
    en: ['Solutions', 'Digital Employees', 'Ovela Digital Cards', 'Business Automation', 'Industry Solutions'],
    es: ['Soluciones', 'Empleados digitales', 'Ovela Digital Cards', 'Automatización empresarial', 'Soluciones por sector'],
    fr: ['Solutions', 'Employés numériques', 'Ovela Digital Cards', 'Automatisation d’entreprise', 'Solutions sectorielles'],
    de: ['Lösungen', 'Digitale Mitarbeiter', 'Ovela Digital Cards', 'Geschäftsautomatisierung', 'Branchenlösungen'],
    pt: ['Soluções', 'Colaboradores digitais', 'Ovela Digital Cards', 'Automação empresarial', 'Soluções por setor'],
    ca: ['Solucions', 'Empleats digitals', 'Ovela Digital Cards', 'Automatització empresarial', 'Solucions per sector'],
  };
  const labels = solutionLabels[lang] ?? solutionLabels.en;
  const solutions = [
    { name: labels[1], path: `${langPrefix}/#meet-team` },
    { name: labels[2], path: `${langPrefix}/#digital-cards` },
    { name: labels[3], path: `${langPrefix}/#solutions` },
    { name: labels[4], path: `${langPrefix}/projects` },
  ];

  useEffect(() => { setIsOpen(false); }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <nav className={`fixed top-0 w-full pointer-events-none ${isOpen ? 'z-[110]' : 'z-50'}`}>
      <div ref={dropdownRef} className="flex items-center justify-between px-5 py-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="pointer-events-auto flex items-center space-x-2">
          {/* Isabella silhouette mark — the yellow-gown figure is part of the
              Ovela wordmark identity, sized to the cap-height of the "O". */}
          <img
            src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759836676/golddress_ibt1fp.png"
            alt=""
            aria-hidden="true"
            className="h-7 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(212,175,55,0.35))' }}
            loading="eager"
            decoding="async"
          />
          <div className="text-2xl font-bold">
            <span className="gradient-text">Ovela</span>
          </div>
          <div className="text-sm font-medium" style={{ color: 'hsl(var(--champagne-gold))' }}>Interactive</div>
        </Link>

        {/* Language Switcher and Hamburger Menu */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="relative z-50 text-soft-white hover:bg-soft-white/10 hover:text-soft-white [&_svg]:size-7"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="navigation-menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </Button>
        </div>
      {/* Luxury Dropdown Menu */}
      {isOpen && (
        <div 
          id="navigation-menu"
          className="solution-menu fixed right-4 top-16 w-[350px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-lg border border-solution-gold/40 bg-solution p-5 text-solution-foreground pointer-events-auto md:right-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2"
        >
          <p className="mb-2 text-xs uppercase text-solution-muted">{labels[0]}</p>
          <div className="flex flex-col">
            {solutions.map(item => <Button key={item.name} asChild variant="link" className="h-auto justify-start whitespace-normal px-0 py-2 text-left font-playfair text-lg text-solution-gold"><Link to={item.path} onClick={() => setIsOpen(false)}>{item.name}</Link></Button>)}
          </div>
          <div className="my-3 border-t border-solution-border" />
          <div className="grid grid-cols-2 gap-x-3">
            {navItems.map(item => <Button key={item.path} asChild variant="link" className="h-auto justify-start whitespace-normal px-0 py-2 text-left text-sm text-solution-muted hover:text-solution-foreground"><Link to={item.path} onClick={() => setIsOpen(false)}>{item.name}</Link></Button>)}
          </div>
          <div className="mt-3 border-t border-solution-border pt-3">
            <Button asChild variant="link" className="h-auto w-full justify-between px-0 py-1 text-solution-cyan"><a href="https://iipeexchange.lovable.app/" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>IIPE <ArrowUpRight /></a></Button>
          </div>
        </div>
      )}
      </div>
    </nav>
  );
};

export default Navigation;
