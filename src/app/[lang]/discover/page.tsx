import type { Metadata } from 'next';
import { getActiveMaps, getMap, getRecentMaps } from '../../../lib/maps';
import { getRecentReviews } from '../../../lib/reviews';
import { getDictionary } from '../../../utils/getDictionary';
import DiscoverPageClient from './DiscoverPageClient';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.discover} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: {
      canonical: `${endpoint}/${lang}/discover`,
      languages: {
        en: `${endpoint}/en/discover`,
        ja: `${endpoint}/ja/discover`,
        'x-default': `${endpoint}/en/discover`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/discover`,
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function DiscoverPage({ params }: Props) {
  const { lang } = await params;
  const mapId = process.env.NEXT_PUBLIC_PICKED_UP_MAP_ID;
  const [recentReviews, activeMaps, recentMaps, pickUpMap] = await Promise.all([
    getRecentReviews(lang),
    getActiveMaps(lang),
    getRecentMaps(lang),
    mapId ? getMap(mapId, lang) : Promise.resolve(null)
  ]);

  return (
    <DiscoverPageClient
      recentReviews={recentReviews}
      activeMaps={activeMaps}
      recentMaps={recentMaps}
      pickUpMap={pickUpMap}
    />
  );
}
