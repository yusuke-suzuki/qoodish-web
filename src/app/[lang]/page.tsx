import type { Metadata } from 'next';
import { getServerAuthState } from '../../lib/auth';
import { getPopularReviews } from '../../lib/reviews';
import { getDictionary } from '../../utils/getDictionary';
import HomePageClient from './HomePageClient';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = 'Qoodish';
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
      canonical: `${endpoint}/${lang}`,
      languages: {
        en: `${endpoint}/en`,
        ja: `${endpoint}/ja`,
        'x-default': `${endpoint}/en`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}`,
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const { authenticated } = await getServerAuthState();
  const popularReviews = authenticated ? [] : await getPopularReviews(lang);

  return <HomePageClient popularReviews={popularReviews} />;
}
