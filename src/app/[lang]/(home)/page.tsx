import { Stack } from '@mui/material';
import type { Metadata } from 'next';
import LandingFeatures from '../../../components/home/LandingFeatures.tsx';
import LandingHero from '../../../components/home/LandingHero.tsx';
import Timeline from '../../../components/home/Timeline.tsx';
import TrendingReviews from '../../../components/home/TrendingReviews.tsx';
import ContainedShell from '../../../components/layouts/ContainedShell.tsx';
import { getServerAuthState } from '../../../lib/auth.ts';
import { getPopularReviews, getTimelineReviews } from '../../../lib/reviews.ts';
import { getDictionary } from '../../../utils/getDictionary.ts';
import { localePath } from '../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = dict['meta headline'];
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang),
    openGraph: {
      type: 'website',
      title,
      description,
      url: localePath(lang),
      images: ogImages(thumbnailUrl),
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

  if (authenticated) {
    const initialReviews = await getTimelineReviews();

    return (
      <ContainedShell lang={lang}>
        <Timeline initialReviews={initialReviews} />
      </ContainedShell>
    );
  }

  const popularReviews = await getPopularReviews(lang);

  return (
    <>
      <LandingHero />

      <ContainedShell lang={lang}>
        <Stack spacing={{ xs: 2, md: 4 }}>
          <LandingFeatures />
          <TrendingReviews reviews={popularReviews} />
        </Stack>
      </ContainedShell>
    </>
  );
}
