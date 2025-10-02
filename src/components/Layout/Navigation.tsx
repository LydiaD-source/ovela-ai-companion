import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'WellnessGeni', path: '/wellnessgeni' },
    { name: 'Projects', path: '/projects' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Meet Isabella', path: '/#chat' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="gradient-text">Ovela</span>
            </div>
            <div className="text-sm font-medium" style={{ color: 'hsl(var(--champagne-gold))' }}>Interactive</div>
          </Link>

          {/* Hamburger Menu Button (Always Visible) */}
          <button
            className="p-2 transition-colors duration-200 hover:text-champagne-gold"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            style={{ color: 'hsl(var(--champagne-gold))' }}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Full-Screen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-midnight-blue/95 backdrop-blur-lg flex items-center justify-center">
          <div className="flex flex-col items-center space-y-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-3xl font-medium transition-all duration-200 hover:text-champagne-gold hover:scale-110 ${
                  isActive(item.path) ? 'text-champagne-gold' : 'text-soft-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
