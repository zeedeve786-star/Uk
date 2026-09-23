import type { ServiceType } from './booking';

export type ContentStatus = 'draft' | 'published';

export interface SeoMetadata {
  seoTitle: string;
  metaDescription: string;
  canonical?: string;
  /** Kept false for placeholder/draft content so it is not indexed before real copy exists. */
  indexable: boolean;
}

export interface ServiceContentEntry {
  id: string;
  categorySlug: ServiceType;
  title: string;
  slug: string;
  path: string; // e.g. /services/airport/airport-transfer-planning
  excerpt: string;
  body: string;
  seo: SeoMetadata;
  status: ContentStatus;
  featured?: boolean;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  relatedEntryIds?: string[];
}

export interface ServiceCategoryContent {
  slug: ServiceType;
  path: string; // e.g. /services/airport
  iconPlaceholder: string;
  seo: SeoMetadata;
  entries: ServiceContentEntry[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}