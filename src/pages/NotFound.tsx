import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

// URLs that should return 410 Gone (permanently removed)
const GONE_URLS = [
  '/old-page',
  '/deprecated',
  '/removed-feature',
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // SEO: Set noindex for 404 pages
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex, follow');
    } else {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      robotsMeta.setAttribute('content', 'noindex, follow');
      document.head.appendChild(robotsMeta);
    }

    // Set page title for 404
    document.title = 'Page Not Found | Ovela Interactive';

    // Handle common redirects for outdated/mistyped URLs (301 permanent redirects)
    const redirectMap: Record<string, string> = {
      // Partner variations
      '/partners': '/partner',
      '/partnership': '/partner',
      '/partner-with-us': '/partner',
      '/work-with-us': '/partner',
      '/collaborate': '/partner',
      
      // Pricing variations
      '/price': '/pricing',
      '/prices': '/pricing',
      '/cost': '/pricing',
      '/packages': '/pricing',
      
      // About variations
      '/about-us': '/about',
      '/team': '/about',
      '/our-story': '/about',
      '/story': '/about',
      
      // Projects variations
      '/portfolio': '/projects',
      '/work': '/projects',
      '/case-studies': '/projects',
      '/gallery': '/projects',
      
      // Contact variations
      '/contact-us': '/contact',
      '/get-in-touch': '/contact',
      '/reach-us': '/contact',
      
      // Interactive/Isabella variations
      '/wellness': '/wellnessgeni',
      '/ai': '/interactive',
      '/ai-model': '/interactive',
      '/isabella': '/interactive',
      '/demo': '/interactive',
      '/avatar': '/interactive',
      
      // Home variations
      '/home': '/',
      '/index': '/',
      '/main': '/',
      
      // Removed/legacy pages - redirect to home
      '/locale-tools': '/',
      '/tools': '/',
      '/services': '/',
    };

    if (redirectMap[path]) {
      // Use replace for 301-like behavior (doesn't add to history)
      navigate(redirectMap[path], { replace: true });
      return;
    }

    // Check for 410 Gone URLs
    if (GONE_URLS.includes(path)) {
      // For 410, we still show the 404 page but could track differently
      console.log('410 Gone:', path);
    }

    // Cleanup on unmount
    return () => {
      // Reset robots meta when leaving 404 page
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) {
        meta.setAttribute('content', 'index, follow');
      }
    };
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0D0D1A 0%, #000000 100%)' }}>
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#E8CFA9', fontFamily: 'Playfair Display, serif' }}>404</h1>
        <p className="text-xl text-white/70 mb-8">Oops! Page not found</p>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/" 
            className="inline-block px-6 py-3 rounded-md text-white transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #E8CFA9 0%, #D4AF37 100%)', color: '#0A0A23' }}
          >
            Return to Home
          </a>
          <a 
            href="/contact" 
            className="inline-block px-6 py-3 rounded-md border transition-all duration-300 hover:scale-105"
            style={{ borderColor: '#E8CFA9', color: '#E8CFA9' }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
