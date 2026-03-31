import { useEffect } from 'react';

const BASE_URL = 'https://www.ovelainteractive.com';

// Organization Schema for Ovela Interactive
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ovela Interactive",
  "alternateName": "Ovela",
  "url": BASE_URL,
  "logo": `${BASE_URL}/favicon.png`,
  "description": "Ovela Interactive creates AI-powered brand ambassadors and interactive digital experiences for businesses worldwide.",
  "foundingDate": "2024",
  "sameAs": [
    "https://www.linkedin.com/company/ovela-interactive"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "url": `${BASE_URL}/contact`,
    "availableLanguage": ["English", "Spanish", "French", "German", "Portuguese"]
  },
  "areaServed": "Worldwide",
  "knowsAbout": [
    "AI Brand Ambassadors",
    "Interactive Marketing",
    "Digital Avatars",
    "Conversational AI",
    "Brand Engagement"
  ]
};

// WebSite Schema
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Ovela Interactive",
  "url": BASE_URL,
  "description": "AI-powered brand ambassadors and interactive digital experiences",
  "publisher": {
    "@type": "Organization",
    "name": "Ovela Interactive"
  }
};

// Service Schema for AI Brand Ambassador services
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "AI Brand Ambassador Services",
  "provider": {
    "@type": "Organization",
    "name": "Ovela Interactive",
    "url": BASE_URL
  },
  "description": "Custom AI brand ambassador solutions featuring Isabella, providing multilingual, interactive customer engagement through advanced conversational AI and lifelike video technology.",
  "serviceType": "AI Brand Ambassador",
  "areaServed": "Worldwide",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": `${BASE_URL}/contact`,
    "serviceType": "Online consultation"
  }
};

// Service schemas for pricing page (replaces Product schemas)
export const pricingServiceSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Product Promotion Campaign",
    "description": "Isabella showcases your product in a personalized video or post with cinematic, high-conversion content.",
    "provider": { "@type": "Organization", "name": "Ovela Interactive", "url": BASE_URL },
    "areaServed": "Worldwide",
    "serviceType": "AI Content Production"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Social Media Feature",
    "description": "Strategic brand feature across Isabella's social channels with scroll-stopping content.",
    "provider": { "@type": "Organization", "name": "Ovela Interactive", "url": BASE_URL },
    "areaServed": "Worldwide",
    "serviceType": "Social Media Marketing"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Event Presence",
    "description": "Interactive AI presence for digital or hybrid events — engaging audiences live.",
    "provider": { "@type": "Organization", "name": "Ovela Interactive", "url": BASE_URL },
    "areaServed": "Worldwide",
    "serviceType": "Event Marketing"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Custom AI Ambassador",
    "description": "Fully tailored AI ambassador designed to match your brand identity, audience, and goals.",
    "provider": { "@type": "Organization", "name": "Ovela Interactive", "url": BASE_URL },
    "areaServed": "Worldwide",
    "serviceType": "Custom AI Development"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Website Integration",
    "description": "Embed Isabella directly on your website for 24/7 customer engagement, lead capture, and service booking.",
    "provider": { "@type": "Organization", "name": "Ovela Interactive", "url": BASE_URL },
    "areaServed": "Worldwide",
    "serviceType": "Website AI Integration"
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Ambassador Video Package",
    "description": "Professional AI-generated video content featuring Isabella for your brand.",
    "provider": { "@type": "Organization", "name": "Ovela Interactive", "url": BASE_URL },
    "areaServed": "Worldwide",
    "serviceType": "AI Video Production"
  }
];

// VideoObject Schema for promo videos
export const createVideoSchema = (video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  duration?: string;
  uploadDate?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": video.name,
  "description": video.description,
  "thumbnailUrl": video.thumbnailUrl,
  "contentUrl": video.contentUrl,
  "uploadDate": video.uploadDate || "2024-01-01",
  "duration": video.duration || "PT1M",
  "publisher": {
    "@type": "Organization",
    "name": "Ovela Interactive",
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/favicon.png`
    }
  }
});

// FAQPage Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Isabella AI Brand Ambassador?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Isabella is an AI-powered brand ambassador created by Ovela Interactive. She provides personalized customer engagement through natural conversation, voice interaction, and lifelike video streaming in multiple languages."
      }
    },
    {
      "@type": "Question",
      "name": "What languages does Isabella support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Isabella supports multiple languages including English, Spanish, French, German, and Portuguese, with more languages being added regularly."
      }
    },
    {
      "@type": "Question",
      "name": "How can Isabella help my business?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Isabella can serve as your 24/7 brand ambassador, handling customer inquiries, providing service information, and creating engaging interactive experiences that boost customer engagement and conversion rates."
      }
    },
    {
      "@type": "Question",
      "name": "Can Isabella be customized for my brand?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Isabella can be fully customized with your brand's knowledge base, personality, appearance, and voice to match your brand identity and customer needs."
      }
    },
    {
      "@type": "Question",
      "name": "What industries can benefit from AI brand ambassadors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI brand ambassadors like Isabella are ideal for retail, hospitality, healthcare, real estate, wellness, finance, and any industry that values personalized customer engagement and 24/7 availability."
      }
    }
  ]
};

// WebPage schema factory for individual pages
export const createWebPageSchema = (page: {
  name: string;
  description: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": page.name,
  "description": page.description,
  "url": `${BASE_URL}${page.path}`,
  "isPartOf": {
    "@type": "WebSite",
    "name": "Ovela Interactive",
    "url": BASE_URL
  },
  "publisher": {
    "@type": "Organization",
    "name": "Ovela Interactive",
    "url": BASE_URL
  }
});

/**
 * Hook to inject JSON-LD structured data into the document head
 */
export const useStructuredData = (
  schemas: object | object[],
  id: string = 'structured-data'
) => {
  useEffect(() => {
    const schemaArray = Array.isArray(schemas) ? schemas : [schemas];
    
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(
      schemaArray.length === 1 ? schemaArray[0] : schemaArray
    );
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schemas, id]);
};

export default useStructuredData;
