import type { MetadataRoute } from 'next';
import { getRecentChapters } from '../lib/chapters.ts';
import { getActiveMaps, getPopularMaps, getRecentMaps } from '../lib/maps.ts';
import { getPopularReviews, getRecentReviews } from '../lib/reviews.ts';
import { DEFAULT_LOCALE, LOCALES, localePath } from '../utils/locales.ts';
import { SITE_ORIGIN } from '../utils/metadata.ts';

export const revalidate = 3600;

type Entry = {
  path: string;
  lastModified?: string;
  priority: number;
};

const STATIC_ENTRIES: Entry[] = [
  { path: '/', priority: 1 },
  { path: '/discover', priority: 0.8 },
  { path: '/login', priority: 0.5 },
  { path: '/terms', priority: 0.3 },
  { path: '/privacy', priority: 0.3 }
];

function absoluteUrl(locale: string, path: string): string {
  return `${SITE_ORIGIN}${localePath(locale, path)}`;
}

// One entry per locale, each carrying the full hreflang set: without them Google
// has no way to tell the localized variants apart from duplicates of each other.
function expand({
  path,
  lastModified,
  priority
}: Entry): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: absoluteUrl(locale, path),
    lastModified,
    priority,
    alternates: {
      languages: {
        en: absoluteUrl('en', path),
        ja: absoluteUrl('ja', path),
        'x-default': absoluteUrl(DEFAULT_LOCALE, path)
      }
    }
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    activeMaps,
    popularMaps,
    recentMaps,
    popularReviews,
    recentReviews,
    recentChapters
  ] = await Promise.all([
    getActiveMaps(DEFAULT_LOCALE),
    getPopularMaps(DEFAULT_LOCALE),
    getRecentMaps(DEFAULT_LOCALE),
    getPopularReviews(DEFAULT_LOCALE),
    getRecentReviews(DEFAULT_LOCALE),
    getRecentChapters(DEFAULT_LOCALE)
  ]);

  const mapEntries = new Map<number, Entry>();

  for (const map of [...activeMaps, ...popularMaps, ...recentMaps]) {
    if (map.private) {
      continue;
    }

    mapEntries.set(map.id, {
      path: `/maps/${map.id}`,
      lastModified: map.updated_at,
      priority: 0.7
    });
  }

  const reviewEntries = new Map<number, Entry>();

  for (const review of [...popularReviews, ...recentReviews]) {
    if (review.map.private) {
      continue;
    }

    reviewEntries.set(review.id, {
      path: `/maps/${review.map.id}/reports/${review.id}`,
      lastModified: review.updated_at,
      priority: 0.6
    });
  }

  const chapterEntries = new Map<number, Entry>();

  for (const chapter of recentChapters) {
    if (chapter.status !== 'published') {
      continue;
    }

    chapterEntries.set(chapter.id, {
      path: `/chapters/${chapter.id}`,
      lastModified: chapter.updated_at,
      priority: 0.6
    });
  }

  return [
    ...STATIC_ENTRIES,
    ...Array.from(mapEntries.values()),
    ...Array.from(reviewEntries.values()),
    ...Array.from(chapterEntries.values())
  ].flatMap(expand);
}
