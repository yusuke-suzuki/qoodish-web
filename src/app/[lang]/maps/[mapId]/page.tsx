import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import MapDetailView from '../../../../components/maps/MapDetailView';
import { getServerAuthState } from '../../../../lib/auth';
import { getMap } from '../../../../lib/maps';
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
  const { token } = await getServerAuthState();
  const map = await getMap(mapId, lang, token);

  if (!map) {
    notFound();
  }

  return (
    <Suspense>
      <MapDetailView map={map} />
    </Suspense>
  );
}
