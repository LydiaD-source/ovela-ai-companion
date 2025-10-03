import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Portfolio', path: '/projects' },
    { name: 'Contact', path: '/partner' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="fixed top-0 w-full z-50 pointer-events-none">
      <div className="flex items-center justify-between" style={{ padding: '20px 30px 30px 30px' }}>
        {/* Logo */}
        <Link to="/" className="pointer-events-auto flex items-center space-x-2">
          <div className="text-2xl font-bold">
            <span className="gradient-text">Ovela</span>
          </div>
          <div className="text-sm font-medium" style={{ color: 'hsl(var(--champagne-gold))' }}>Interactive</div>
        </Link>

        {/* Hamburger Menu Button */}
        <button
          className="pointer-events-auto p-2 transition-colors duration-200 relative z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{ color: 'white' }}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Luxury Dropdown Menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed right-4 md:right-8 top-20 w-full md:w-[350px] max-w-[calc(100%-2rem)] pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            background: 'rgba(10, 10, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid hsl(var(--champagne-gold))',
            borderRadius: '12px',
            boxShadow: '0 0 30px rgba(232, 207, 169, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
            maxHeight: '30vh',
            overflowY: 'auto'
          }}
        >
          <div className="flex flex-col p-4">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="relative group py-3 transition-all duration-300"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.125rem',
                  lineHeight: '40px',
                  color: 'hsl(var(--champagne-gold))',
                  borderBottom: index < navItems.length - 1 ? '1px solid rgba(232, 207, 169, 0.1)' : 'none'
                }}
              >
                <span className="relative inline-block">
                  {item.name}
                  <span 
                    className="absolute bottom-0 left-0 w-0 h-[2px] group-hover:w-full transition-all duration-300"
                    style={{
                      background: 'hsl(var(--champagne-gold))',
                      boxShadow: '0 0 8px hsl(var(--champagne-gold))'
                    }}
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
