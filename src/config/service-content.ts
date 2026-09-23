import type { ServiceType } from '../models/booking';
import type { ServiceCategoryContent, ServiceContentEntry } from '../models/service-content';
import { serviceContent } from './services';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildEntries(categorySlug: ServiceType, categoryPath: string, titles: string[]): ServiceContentEntry[] {
  return titles.map((title, index) => {
    const slug = slugify(title);
    return {
      id: `${categorySlug}-${index + 1}`,
      categorySlug,
      title,
      slug,
      path: `${categoryPath}/${slug}`,
      excerpt: 'Sample service information will be added here once the final client content is confirmed.',
      body: 'Sample service information will be added here once the final client content is confirmed.',
      seo: {
        seoTitle: title,
        metaDescription: 'Placeholder meta description — to be confirmed with final client content.',
        indexable: false,
      },
      status: 'draft',
    };
  });
}

const airportTitles = [
  'Airport Transfer Planning',
  'Airport Pickup Information',
  'Airport Drop-off Guidance',
  'Private Airport Transfer Benefits',
  'Airport Travel With Luggage',
  'Group Airport Transport',
  'Airport Journey Preparation',
  'Airport Transfer FAQs',
];

const railwayTitles = [
  'Railway Transfer Planning',
  'Railway Station Pickup Information',
  'Railway Station Drop-off Guidance',
  'Private Railway Transfer Benefits',
  'Railway Travel With Luggage',
  'Group Railway Transport',
  'Railway Journey Preparation',
  'Railway Transfer FAQs',
];

const cruiseTitles = [
  'Cruise Transfer Planning',
  'Cruise Terminal Pickup Information',
  'Cruise Terminal Drop-off Guidance',
  'Private Cruise Transfer Benefits',
  'Cruise Travel With Luggage',
  'Group Cruise Transport',
  'Cruise Journey Preparation',
  'Cruise Transfer FAQs',
];

const eventTitles = [
  'Event Transport Planning',
  'Event Pickup Information',
  'Event Drop-off Guidance',
  'Private Event Transfer Benefits',
  'Event Travel With Luggage',
  'Group Event Transport',
  'Event Journey Preparation',
  'Event Transfer FAQs',
];

export const serviceCategoryContent: ServiceCategoryContent[] = [
  {
    slug: 'airport',
    path: '/services/airport',
    iconPlaceholder: 'Airport service icon placeholder',
    seo: {
      seoTitle: 'Airport Services',
      metaDescription: 'Placeholder meta description — to be confirmed with final client content.',
      indexable: true,
    },
    entries: buildEntries('airport', '/services/airport', airportTitles),
  },
  {
    slug: 'railway',
    path: '/services/railway',
    iconPlaceholder: 'Railway service icon placeholder',
    seo: {
      seoTitle: 'Railway Services',
      metaDescription: 'Placeholder meta description — to be confirmed with final client content.',
      indexable: true,
    },
    entries: buildEntries('railway', '/services/railway', railwayTitles),
  },
  {
    slug: 'cruise',
    path: '/services/cruise',
    iconPlaceholder: 'Cruise service icon placeholder',
    seo: {
      seoTitle: 'Cruise Services',
      metaDescription: 'Placeholder meta description — to be confirmed with final client content.',
      indexable: true,
    },
    entries: buildEntries('cruise', '/services/cruise', cruiseTitles),
  },
  {
    slug: 'event',
    path: '/services/events',
    iconPlaceholder: 'Event service icon placeholder',
    seo: {
      seoTitle: 'Event Services',
      metaDescription: 'Placeholder meta description — to be confirmed with final client content.',
      indexable: true,
    },
    entries: buildEntries('event', '/services/events', eventTitles),
  },
];

export function getCategoryContent(slug: ServiceType): ServiceCategoryContent | undefined {
  return serviceCategoryContent.find((c) => c.slug === slug);
}

export function getCategoryDisplay(slug: ServiceType) {
  return serviceContent.find((s) => s.id === slug);
}

export function getEntry(slug: ServiceType, entrySlug: string): ServiceContentEntry | undefined {
  return getCategoryContent(slug)?.entries.find((e) => e.slug === entrySlug);
}