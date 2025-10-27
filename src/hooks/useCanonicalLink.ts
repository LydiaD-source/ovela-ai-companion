import { useEffect } from 'react';

/**
 * Hook to add canonical link to page for SEO
 */
export const useCanonicalLink = (path: string) => {
  useEffect(() => {
    const baseUrl = 'https://ovelainteractive.com';
    const canonicalUrl = `${baseUrl}${path}`;
    
    // Remove existing canonical link if present
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    
    // Add new canonical link
    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', canonicalUrl);
    document.head.appendChild(canonical);
    
    // Cleanup on unmount
    return () => {
      const link = document.querySelector(`link[rel="canonical"][href="${canonicalUrl}"]`);
      if (link) {
        link.remove();
      }
    };
  }, [path]);
};
