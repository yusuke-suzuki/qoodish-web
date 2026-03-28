import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getReview } from '../../../../../../lib/reviews';
import { getDictionary } from '../../../../../../utils/getDictionary';
import ReviewPageClient from './ReviewPageClient';

type Props = {
  params: Promise<{ lang: string; mapId: string; reviewId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, mapId, reviewId } = await params;
  const dict = getDictionary(lang);
  const review = await getReview(reviewId, lang);

  const title = review
    ? `${review.name} - ${review.map.name} | Qoodish`
    : 'Qoodish';
  const description = review ? review.comment : dict['meta description'];
  const keywords = `${
    review ? `${review.map.name}, ${review.name}, ` : ''
  }Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const defaultThumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const thumbnailUrl =
    review && review.images.length > 0
      ? review.images[0].thumbnail_url_800
      : defaultThumbnailUrl;
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;

  return {
    title,
    description,
    keywords,
    robots: !review || review.map.private ? 'noindex' : undefined,
    alternates: {
      canonical: `${endpoint}/${lang}/maps/${mapId}/reports/${reviewId}`,
      languages: {
        en: `${endpoint}/en/maps/${mapId}/reports/${reviewId}`,
        ja: `${endpoint}/ja/maps/${mapId}/reports/${reviewId}`,
        'x-default': `${endpoint}/en/maps/${mapId}/reports/${reviewId}`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/maps/${mapId}/reports/${reviewId}`,
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function ReviewPage({ params }: Props) {
  const { lang, reviewId } = await params;
  const initialReview = await getReview(reviewId, lang);

  return (
    <Suspense>
      <ReviewPageClient initialReview={initialReview} />
    </Suspense>
  );
}
