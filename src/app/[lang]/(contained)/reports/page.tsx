import { FiberNew } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import type { Metadata } from 'next';
import ReviewFeed from '../../../../components/reviews/ReviewFeed.tsx';
import { getReviewFeed } from '../../../../lib/reviews.ts';
import { getDictionary } from '../../../../utils/getDictionary.ts';
import { localePath } from '../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict['recent reports']} | Qoodish`;
  const description = dict['meta description'];

  return {
    title,
    description,
    alternates: buildAlternates(lang, '/reports'),
    openGraph: {
      type: 'website',
      title,
      description,
      url: localePath(lang, '/reports'),
      images: ogImages(defaultOgImage(lang), dict['meta headline']),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function ReportsPage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const reviews = await getReviewFeed(lang);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FiberNew color="secondary" />
        <Typography variant="h5" component="h1">
          {dict['recent reports']}
        </Typography>
      </Box>

      <ReviewFeed initialReviews={reviews} />
    </>
  );
}
