import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { AppMap } from '../../../../../types';
import { getDictionary } from '../../../../utils/getDictionary';
import MapPageClient from './MapPageClient';

type Props = {
  params: Promise<{ lang: string; mapId: string }>;
};

async function fetchMap(mapId: string, lang: string): Promise<AppMap | null> {
  try {
    const response = await fetch(
      `${process.env.API_ENDPOINT}/guest/maps/${mapId}`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': lang,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 300 }
      }
    );
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, mapId } = await params;
  const dict = getDictionary(lang);
  const map = await fetchMap(mapId, lang);

  const title = map ? `${map.name} | Qoodish` : 'Qoodish';
  const description = map ? map.description : dict['meta description'];
  const keywords = `${
    map ? `${map.name}, ` : ''
  }Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const defaultThumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const thumbnailUrl = map ? map.thumbnail_url_800 : defaultThumbnailUrl;
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;

  return {
    title,
    description,
    keywords,
    robots: map ? undefined : 'noindex',
    alternates: {
      canonical: `${endpoint}/${lang}/maps/${mapId}`,
      languages: {
        en: `${endpoint}/en/maps/${mapId}`,
        ja: `${endpoint}/ja/maps/${mapId}`,
        'x-default': `${endpoint}/en/maps/${mapId}`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/maps/${mapId}`,
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function MapPage({ params }: Props) {
  const { lang, mapId } = await params;
  const initialMap = await fetchMap(mapId, lang);

  return (
    <Suspense>
      <MapPageClient initialMap={initialMap} />
    </Suspense>
  );
}
