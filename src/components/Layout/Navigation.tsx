import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Projects', path: '/projects' },
    { name: 'WellnessGeni', path: '/wellnessgeni' },
    { name: 'Work With Us', path: '/partner' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 pointer-events-none">
      <div className="flex items-center justify-between" style={{ padding: '30px 40px' }}>
        {/* Logo */}
        <Link to="/" className="pointer-events-auto flex items-center space-x-2">
          <div className="text-2xl font-bold">
            <span className="gradient-text">Ovela</span>
          </div>
          <div className="text-sm font-medium" style={{ color: 'hsl(var(--champagne-gold))' }}>Interactive</div>
        </Link>

        {/* Hamburger Menu Button */}
        <button
          className="pointer-events-auto p-2 transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          style={{ color: 'white' }}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Full-Screen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-lg flex items-center justify-center" style={{
          background: 'rgba(30, 41, 59, 0.95)'
        }}>
          <div className="flex flex-col items-center space-y-8">
            <Link
              to="/"
              className="text-4xl font-light transition-all duration-300 hover:scale-110"
              style={{ color: 'hsl(var(--champagne-gold))' }}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-4xl font-light transition-all duration-300 hover:scale-110"
                style={{ color: 'hsl(var(--champagne-gold))' }}
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
