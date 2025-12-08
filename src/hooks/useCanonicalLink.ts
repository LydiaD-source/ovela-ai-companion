import { useEffect } from 'react';

/**
 * Hook to add canonical link to page for SEO
 * Uses the primary domain without www
 */
export const useCanonicalLink = (path: string) => {
  useEffect(() => {
    // Primary canonical URL format (no www, no trailing slash except homepage)
    const baseUrl = 'https://ovelainteractive.com';
    const canonicalUrl = path === '/' ? baseUrl + '/' : `${baseUrl}${path}`;
    
    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonical);
    }
    
    // Also update OG URL to match canonical
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    } else {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      ogUrl.setAttribute('content', canonicalUrl);
      document.head.appendChild(ogUrl);
    }
    
    // Cleanup on unmount - reset to homepage canonical
    return () => {
      const link = document.querySelector('link[rel="canonical"]');
      if (link) {
        link.setAttribute('href', baseUrl + '/');
      }
    };
  }, [path]);
};
