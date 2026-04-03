import type { Metadata } from 'next';
import { getPopularMaps } from '../../../lib/maps';
import { getDictionary } from '../../../utils/getDictionary';
import PrivacyPageClient from './PrivacyPageClient';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict['privacy policy']} | Qoodish`;
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
      canonical: `${endpoint}/${lang}/privacy`,
      languages: {
        en: `${endpoint}/en/privacy`,
        ja: `${endpoint}/ja/privacy`,
        'x-default': `${endpoint}/en/privacy`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/privacy`,
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  const popularMaps = await getPopularMaps(lang);

  return <PrivacyPageClient popularMaps={popularMaps} />;
}
