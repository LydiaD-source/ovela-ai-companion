import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Handle common redirects for outdated/mistyped URLs
    const redirectMap: Record<string, string> = {
      '/partners': '/partner',
      '/partnership': '/partner',
      '/partner-with-us': '/partner',
      '/work-with-us': '/partner',
      '/collaborate': '/partner',
      '/price': '/pricing',
      '/prices': '/pricing',
      '/cost': '/pricing',
      '/about-us': '/about',
      '/team': '/about',
      '/our-story': '/about',
      '/portfolio': '/projects',
      '/work': '/projects',
      '/case-studies': '/projects',
      '/contact-us': '/contact',
      '/get-in-touch': '/contact',
      '/reach-us': '/contact',
      '/wellness': '/wellnessgeni',
      '/ai': '/interactive',
      '/ai-model': '/interactive',
      '/isabella': '/interactive',
    };

    const path = location.pathname.toLowerCase();
    if (redirectMap[path]) {
      navigate(redirectMap[path], { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0D0D1A 0%, #000000 100%)' }}>
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#E8CFA9', fontFamily: 'Playfair Display, serif' }}>404</h1>
        <p className="text-xl text-white/70 mb-8">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 rounded-md text-white transition-colors"
          style={{ background: 'linear-gradient(135deg, #E8CFA9 0%, #D4AF37 100%)' }}
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
