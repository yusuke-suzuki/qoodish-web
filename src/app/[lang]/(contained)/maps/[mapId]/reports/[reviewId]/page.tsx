import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ReviewDetail from '../../../../../../../components/reviews/ReviewDetail.tsx';
import { getServerAuthState } from '../../../../../../../lib/auth.ts';
import { getReview } from '../../../../../../../lib/reviews.ts';
import { getDictionary } from '../../../../../../../utils/getDictionary.ts';
import { localePath } from '../../../../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../../../../utils/metadata.ts';

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
  const thumbnailUrl =
    review && review.images.length > 0
      ? review.images[0].ogp
      : defaultOgImage(lang);
  const path = `/maps/${mapId}/reports/${reviewId}`;

  return {
    title,
    description,
    keywords,
    robots: !review || review.map.private ? 'noindex' : undefined,
    alternates: buildAlternates(lang, path),
    openGraph: {
      type: 'article',
      title,
      description,
      url: localePath(lang, path),
      images: ogImages(thumbnailUrl),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline'],
      publishedTime: review?.created_at,
      modifiedTime: review?.updated_at
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function ReviewPage({ params }: Props) {
  const { lang, mapId, reviewId } = await params;
  const { token } = await getServerAuthState();
  const review = await getReview(reviewId, lang, token, mapId);

  if (!review) {
    notFound();
  }

  return (
    <Suspense>
      <ReviewDetail review={review} />
    </Suspense>
  );
}
