import { Explore, FiberNew, Whatshot } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import PickUpMap from '../../../../components/discover/PickUpMap.tsx';
import MapGridList from '../../../../components/maps/MapGridList.tsx';
import ReviewGridList from '../../../../components/reviews/ReviewGridList.tsx';
import {
  getActiveMaps,
  getFeaturedMap,
  getRecentMaps
} from '../../../../lib/maps.ts';
import { getRecentReviews } from '../../../../lib/reviews.ts';
import { getDictionary } from '../../../../utils/getDictionary.ts';
import { localePath } from '../../../../utils/locales.ts';
import { buildAlternates, defaultOgImage } from '../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.discover} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/discover'),
    openGraph: {
      title,
      description,
      url: localePath(lang, '/discover'),
      images: [{ url: thumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function DiscoverPage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const [recentReviews, activeMaps, recentMaps, pickUpMap] = await Promise.all([
    getRecentReviews(lang),
    getActiveMaps(lang),
    getRecentMaps(lang),
    getFeaturedMap(lang)
  ]);

  return (
    <Stack spacing={4} divider={<Divider />}>
      <Box component="section">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Explore color="secondary" />
          <Typography variant="subtitle1">{dict['pick up']}</Typography>
        </Box>

        <PickUpMap map={pickUpMap} />
      </Box>

      <Box component="section">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FiberNew color="secondary" />
          <Typography variant="subtitle1">{dict['recent reports']}</Typography>
        </Box>

        <ReviewGridList reviews={recentReviews} />
      </Box>

      <Box component="section">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Whatshot color="secondary" />
          <Typography variant="subtitle1">{dict['active maps']}</Typography>
        </Box>

        <MapGridList maps={activeMaps} />
      </Box>

      <Box component="section">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FiberNew color="secondary" />
          <Typography variant="subtitle1">{dict['recent maps']}</Typography>
        </Box>

        <MapGridList maps={recentMaps} />
      </Box>
    </Stack>
  );
}
