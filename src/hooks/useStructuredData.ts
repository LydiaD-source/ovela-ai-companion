import { useEffect } from 'react';

const BASE_URL = 'https://www.ovelainteractive.com';

// Product Schema for pricing offerings
export const createProductSchema = (product: {
  name: string;
  description: string;
  price: string;
  image?: string;
  sku?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image || `${BASE_URL}/favicon.png`,
  "sku": product.sku || product.name.toLowerCase().replace(/\s+/g, '-'),
  "brand": {
    "@type": "Brand",
    "name": "Ovela Interactive"
  },
  "offers": {
    "@type": "Offer",
    "url": `${BASE_URL}/pricing`,
    "priceCurrency": "EUR",
    "price": product.price.replace(/[^0-9]/g, '') || "0",
    "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Ovela Interactive"
    }
  },
  "provider": {
    "@type": "Organization",
    "name": "Ovela Interactive",
    "url": BASE_URL
  }
});

// Pre-defined Product schemas for pricing page
export const pricingProductSchemas = [
  createProductSchema({
    name: "Product Promotion Package",
    description: "Isabella showcases your product in a personalized video or post.",
    price: "3500",
    image: `${BASE_URL}/images/pricing-product-promotion.jpg`,
    sku: "product-promotion"
  }),
  createProductSchema({
    name: "Social Media Feature",
    description: "Strategic brand feature across Isabella's social channels.",
    price: "5000",
    image: `${BASE_URL}/images/pricing-social-media.jpg`,
    sku: "social-media-feature"
  }),
  createProductSchema({
    name: "Event Presence",
    description: "Isabella as your virtual or in-venue brand ambassador for events.",
    price: "8000",
    image: `${BASE_URL}/images/pricing-event-presence.jpg`,
    sku: "event-presence"
  }),
  createProductSchema({
    name: "Custom AI Ambassador",
    description: "Full custom AI ambassador tailored to your brand identity.",
    price: "15000",
    image: `${BASE_URL}/images/pricing-custom-ambassador.jpg`,
    sku: "custom-ambassador"
  }),
  createProductSchema({
    name: "Website Integration",
    description: "Embed Isabella directly on your website for 24/7 customer engagement.",
    price: "6000",
    image: `${BASE_URL}/images/pricing-website-integration.jpg`,
    sku: "website-integration"
  }),
  createProductSchema({
    name: "Ambassador Video Package",
    description: "Professional AI-generated video content featuring Isabella for your brand.",
    price: "4000",
    image: `${BASE_URL}/images/pricing-ambassador-video.jpg`,
    sku: "ambassador-video"
  })
];

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

// SoftwareApplication Schema for Isabella
export const isabellaSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Isabella – AI Brand Ambassador",
  "alternateName": "Isabella AI",
  "description": "Isabella is an advanced AI-powered brand ambassador that provides personalized, multilingual customer engagement through natural conversation, voice interaction, and lifelike video streaming.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Custom pricing available for enterprise solutions"
  },
  "provider": {
    "@type": "Organization",
    "name": "Ovela Interactive",
    "url": BASE_URL
  },
  "featureList": [
    "Multilingual Support (5+ languages)",
    "Real-time Voice Interaction",
    "Lifelike AI Video Streaming",
    "Brand-specific Knowledge Base",
    "24/7 Availability",
    "Customizable Appearance",
    "Natural Conversation AI"
  ],
  "screenshot": `${BASE_URL}/images/isabella-hero-native.png`,
  "softwareVersion": "2.0",
  "url": `${BASE_URL}/interactive`
};

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
        "text": "Isabella can serve as your 24/7 brand ambassador, handling customer inquiries, providing product information, and creating engaging interactive experiences that boost customer engagement and conversion rates."
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

// WebSite Schema for search box
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
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "AI Brand Ambassador Packages",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Website Integration",
          "description": "Embed Isabella on your website for 24/7 customer engagement"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Brand Ambassador",
          "description": "Fully customized AI ambassador with your brand identity"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Event Presence",
          "description": "Interactive AI presence for trade shows and events"
        }
      }
    ]
  }
};

/**
 * Hook to inject JSON-LD structured data into the document head
 * @param schemas - Array of schema objects or a single schema object
 * @param id - Unique identifier for the script tag
 */
export const useStructuredData = (
  schemas: object | object[],
  id: string = 'structured-data'
) => {
  useEffect(() => {
    const schemaArray = Array.isArray(schemas) ? schemas : [schemas];
    
    // Remove existing script with same id
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(
      schemaArray.length === 1 ? schemaArray[0] : schemaArray
    );
    
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schemas, id]);
};

export default useStructuredData;
