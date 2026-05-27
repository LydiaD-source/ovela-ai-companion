import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGS } from '@/i18n';

const languages = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'ca', name: 'Català', flag: '🏳️' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

/**
 * Strip a leading language prefix (if any) from a pathname.
 * Returns the path without prefix, always starting with '/'.
 */
function stripLangPrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length && (SUPPORTED_LANGS as readonly string[]).includes(segments[0])) {
    segments.shift();
  }
  return '/' + segments.join('/');
}

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language?.split('-')[0]) || languages[0];

  const handleLanguageChange = (code: string) => {
    const basePath = stripLangPrefix(location.pathname);
    const target = code === 'en' ? (basePath === '/' ? '/' : basePath) : `/${code}${basePath === '/' ? '' : basePath}`;
    i18n.changeLanguage(code);
    navigate(target + location.search + location.hash);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10"
          style={{
            border: '1px solid rgba(232, 207, 169, 0.3)',
            color: 'hsl(var(--champagne-gold))',
          }}
        >
          <Globe className="h-4 w-4" />
          <span className="text-lg">{currentLanguage.flag}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[100] min-w-[160px]"
        style={{
          background: 'rgba(10, 10, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid hsl(var(--champagne-gold))',
          boxShadow: '0 0 20px rgba(232, 207, 169, 0.2)',
        }}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-2 ${
              currentLanguage.code === lang.code ? 'bg-white/10' : ''
            }`}
            style={{ color: 'hsl(var(--champagne-gold))' }}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
