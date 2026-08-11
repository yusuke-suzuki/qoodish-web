import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ReviewDetail from '../../../../../../../components/reviews/ReviewDetail';
import { getServerAuthState } from '../../../../../../../lib/auth';
import { getReview } from '../../../../../../../lib/reviews';
import { getDictionary } from '../../../../../../../utils/getDictionary';
import { localePath } from '../../../../../../../utils/locales';
import {
  buildAlternates,
  defaultOgImage
} from '../../../../../../../utils/metadata';

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
      title,
      description,
      url: localePath(lang, path),
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
