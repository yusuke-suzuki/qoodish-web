import type {
  AppMap,
  Author,
  Chapter,
  Profile,
  Review
} from '../../types/index.ts';
import { localePath } from './locales.ts';
import { SITE_ORIGIN } from './metadata.ts';

export type JsonLd = Record<string, unknown> & { '@type': string };

function absoluteUrl(lang: string, path = ''): string {
  return `${SITE_ORIGIN}${localePath(lang, path)}`;
}

function person(lang: string, author: Author | Profile): JsonLd {
  return {
    '@type': 'Person',
    name: author.name,
    url: absoluteUrl(lang, `/users/${author.id}`),
    ...(author.image ? { image: author.image.card } : {})
  };
}

export function organizationJsonLd(lang: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Qoodish',
    url: absoluteUrl(lang),
    logo: 'https://storage.googleapis.com/qoodish.appspot.com/assets/maskable_icon_x512.png'
  };
}

export function webSiteJsonLd(lang: string, description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Qoodish',
    url: absoluteUrl(lang),
    description,
    inLanguage: lang
  };
}

export function reviewJsonLd(lang: string, review: Review): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    url: absoluteUrl(lang, `/maps/${review.map.id}/reports/${review.id}`),
    name: review.name,
    reviewBody: review.comment,
    author: person(lang, review.author),
    datePublished: review.created_at,
    dateModified: review.updated_at,
    inLanguage: lang,
    ...(review.images.length > 0
      ? { image: review.images.map((image) => image.url) }
      : {}),
    itemReviewed: {
      '@type': 'Place',
      name: review.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: review.latitude,
        longitude: review.longitude
      }
    },
    isPartOf: {
      '@type': 'CreativeWork',
      name: review.map.name,
      url: absoluteUrl(lang, `/maps/${review.map.id}`)
    }
  };
}

export function mapJsonLd(
  lang: string,
  map: AppMap,
  reviews: Review[]
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: absoluteUrl(lang, `/maps/${map.id}`),
    name: map.name,
    description: map.description,
    author: person(lang, map.author),
    dateCreated: map.created_at,
    dateModified: map.updated_at,
    inLanguage: lang,
    ...(map.image ? { image: map.image.url } : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: reviews.length,
      itemListElement: reviews.map((review, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: review.name,
        url: absoluteUrl(lang, `/maps/${map.id}/reports/${review.id}`)
      }))
    }
  };
}

export function chapterJsonLd(
  lang: string,
  chapter: Chapter,
  title: string
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    url: absoluteUrl(lang, `/chapters/${chapter.id}`),
    headline: title,
    author: person(lang, chapter.author),
    datePublished: chapter.created_at,
    dateModified: chapter.updated_at,
    inLanguage: lang,
    ...(chapter.image ? { image: chapter.image.url } : {}),
    ...(chapter.map
      ? {
          about: {
            '@type': 'CreativeWork',
            name: chapter.map.name,
            url: absoluteUrl(lang, `/maps/${chapter.map.id}`)
          }
        }
      : {})
  };
}

export function profileJsonLd(
  lang: string,
  profile: Profile,
  maps: AppMap[],
  chapters: Chapter[]
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl(lang, `/users/${profile.id}`),
    mainEntity: {
      ...person(lang, profile),
      ...(profile.biography ? { description: profile.biography } : {})
    },
    hasPart: [
      ...maps
        .filter((map) => !map.private)
        .map((map) => ({
          '@type': 'CreativeWork',
          name: map.name,
          url: absoluteUrl(lang, `/maps/${map.id}`)
        })),
      ...chapters
        .filter((chapter) => chapter.status === 'published')
        .map((chapter) => ({
          '@type': 'Article',
          headline: chapter.title,
          url: absoluteUrl(lang, `/chapters/${chapter.id}`)
        }))
    ]
  };
}

// A closing script tag inside a value would end the element early, so the
// characters that can form one are escaped as their unicode sequences.
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
