import type { Metadata } from 'next';
import LandingClosing from '../../../components/home/LandingClosing.tsx';
import LandingFeatures from '../../../components/home/LandingFeatures.tsx';
import LandingHero from '../../../components/home/LandingHero.tsx';
import Timeline from '../../../components/home/Timeline.tsx';
import TimelineLayout from '../../../components/home/TimelineLayout.tsx';
import TimelineSkeleton from '../../../components/home/TimelineSkeleton.tsx';
import ContainedShell from '../../../components/layouts/ContainedShell.tsx';
import Footer from '../../../components/layouts/Footer.tsx';
import { getServerAuthState } from '../../../lib/auth.ts';
import { getTimelineReviews } from '../../../lib/reviews.ts';
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
      images: ogImages(thumbnailUrl, dict['meta headline']),
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
  const { authenticated, pending } = await getServerAuthState();

  if (authenticated) {
    const initialReviews = await getTimelineReviews();

    return (
      <ContainedShell>
        <TimelineLayout lang={lang}>
          <Timeline initialReviews={initialReviews} />
        </TimelineLayout>
      </ContainedShell>
    );
  }

  // Someone who already has an account has no use for the pitch, and the
  // client refreshes this away as soon as it has a token again.
  if (pending) {
    return (
      <ContainedShell>
        <TimelineLayout lang={lang}>
          <TimelineSkeleton />
        </TimelineLayout>
      </ContainedShell>
    );
  }

  return (
    <>
      <LandingHero />
      <LandingFeatures />
      <LandingClosing />

      <Footer />
    </>
  );
}
