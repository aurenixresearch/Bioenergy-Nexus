import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate JSON-LD for Breadcrumbs SEO schema
  const schemaItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://aurenix-research.org/'
    },
    ...items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 2,
      name: item.label,
      item: item.href ? `https://aurenix-research.org${item.href}` : undefined
    }))
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}
