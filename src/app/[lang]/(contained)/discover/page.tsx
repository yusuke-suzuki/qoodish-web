import { Explore, FiberNew, Whatshot } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import PickUpMap from '../../../../components/discover/PickUpMap';
import MapGridList from '../../../../components/maps/MapGridList';
import ReviewGridList from '../../../../components/reviews/ReviewGridList';
import { getActiveMaps, getMap, getRecentMaps } from '../../../../lib/maps';
import { getRecentReviews } from '../../../../lib/reviews';
import { getDictionary } from '../../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.discover} | Qoodish`;
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
      canonical: `${endpoint}/${lang}/discover`,
      languages: {
        en: `${endpoint}/en/discover`,
        ja: `${endpoint}/ja/discover`,
        'x-default': `${endpoint}/en/discover`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/discover`,
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
  const mapId = process.env.NEXT_PUBLIC_PICKED_UP_MAP_ID;
  const [recentReviews, activeMaps, recentMaps, pickUpMap] = await Promise.all([
    getRecentReviews(lang),
    getActiveMaps(lang),
    getRecentMaps(lang),
    mapId ? getMap(mapId, lang) : Promise.resolve(null)
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
