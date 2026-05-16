import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import MapDetailView from '../../../../components/maps/MapDetailView';
import { getServerAuthState } from '../../../../lib/auth';
import { getMap, getMapFollowers, getMapReviews } from '../../../../lib/maps';
import { getProfile } from '../../../../lib/users';
import { getDictionary } from '../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string; mapId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, mapId } = await params;
  const dict = getDictionary(lang);
  const map = await getMap(mapId, lang);

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
  const endpoint = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;

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
  const { token, uid } = await getServerAuthState();
  const [map, reviews, followers, profile] = await Promise.all([
    getMap(mapId, lang, token),
    getMapReviews(mapId, lang, token),
    getMapFollowers(mapId, lang, token),
    uid ? getProfile(uid, lang, token) : Promise.resolve(null)
  ]);

  if (!map) {
    notFound();
  }

  return (
    <Suspense>
      <MapDetailView
        map={map}
        reviews={reviews}
        followers={followers}
        currentProfile={profile}
      />
    </Suspense>
  );
}
