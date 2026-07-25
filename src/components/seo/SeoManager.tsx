import React, { useEffect } from 'react';

export interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'Aurenix — Connecting Energy and Climate Research, Innovation, and Global Collaboration';
const DEFAULT_DESC = 'Aurenix connects African researchers, students, universities, innovators, and energy & climate stakeholders with global partners to advance clean energy research, technology, funding, and sustainable development.';
const DEFAULT_IMAGE = 'https://lh3.googleusercontent.com/d/1t_ZlrLjmjasOCDhzkwmIohFTqC8ux0oZ';
const DEFAULT_DOMAIN = 'https://aurenix-research.org';

const DEFAULT_KEYWORDS = [
  'Energy research',
  'Renewable energy',
  'Clean energy innovation',
  'Climate technology',
  'Energy technology',
  'Sustainable development',
  'Energy storage',
  'Climate research',
  'Energy policy',
  'African energy innovation',
  'African climate technology',
  'Global research collaboration',
  'Solar energy',
  'Bioenergy',
  'Smart grids'
];

export default function SeoManager({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  author = 'Aurenix Research & Innovation Network',
  publishedDate,
  modifiedDate,
  noIndex = false,
  jsonLd
}: SeoProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title 
      ? (title.includes('Aurenix') ? title : `${title} | Aurenix`)
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : DEFAULT_DOMAIN);
    const metaDescription = description || DEFAULT_DESC;
    const metaKeywords = keywords ? keywords.join(', ') : DEFAULT_KEYWORDS.join(', ');

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', metaKeywords);
    setMetaTag('meta[name="author"]', 'name', 'author', author);
    setMetaTag('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Aurenix Research Platform');

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // Article dates if provided
    if (publishedDate) {
      setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', publishedDate);
    }
    if (modifiedDate) {
      setMetaTag('meta[property="article:modified_time"]', 'property', 'article:modified_time', modifiedDate);
    }

    // 5. Canonical Link
    setLinkTag('canonical', currentUrl);

    // 6. JSON-LD Structured Data
    let scriptElement = document.getElementById('aurenix-jsonld') as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'aurenix-jsonld';
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const defaultOrganizationSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${DEFAULT_DOMAIN}/#organization`,
          name: 'Aurenix Research & Climate Innovation Network',
          url: DEFAULT_DOMAIN,
          logo: DEFAULT_IMAGE,
          description: DEFAULT_DESC,
          sameAs: [
            'https://twitter.com/AurenixResearch',
            'https://linkedin.com/company/aurenix-research'
          ]
        },
        {
          '@type': 'WebSite',
          '@id': `${DEFAULT_DOMAIN}/#website`,
          url: DEFAULT_DOMAIN,
          name: 'Aurenix',
          description: DEFAULT_DESC,
          publisher: { '@id': `${DEFAULT_DOMAIN}/#organization` },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${DEFAULT_DOMAIN}/research?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      ]
    };

    const finalSchema = jsonLd || defaultOrganizationSchema;
    scriptElement.textContent = JSON.stringify(finalSchema, null, 2);

  }, [title, description, keywords, canonicalUrl, ogType, ogImage, author, publishedDate, modifiedDate, noIndex, jsonLd]);

  return null;
}
