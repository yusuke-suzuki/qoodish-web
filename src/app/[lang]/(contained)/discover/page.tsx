import { Explore, FiberNew, HistoryEdu, Whatshot } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';
import ChapterList from '../../../../components/chapters/ChapterList.tsx';
import PickUpMap from '../../../../components/discover/PickUpMap.tsx';
import SectionHeading from '../../../../components/discover/SectionHeading.tsx';
import MapGridList from '../../../../components/maps/MapGridList.tsx';
import ReviewGridList from '../../../../components/reviews/ReviewGridList.tsx';
import { getRecentChapters } from '../../../../lib/chapters.ts';
import {
  getActiveMaps,
  getFeaturedMap,
  getRecentMaps
} from '../../../../lib/maps.ts';
import { getRecentReviews } from '../../../../lib/reviews.ts';
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
      type: 'website',
      title,
      description,
      url: localePath(lang, '/discover'),
      images: ogImages(thumbnailUrl, dict['meta headline']),
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
  const [recentReviews, recentChapters, activeMaps, recentMaps, pickUpMap] =
    await Promise.all([
      getRecentReviews(lang),
      getRecentChapters(lang),
      getActiveMaps(lang),
      getRecentMaps(lang),
      getFeaturedMap(lang)
    ]);

  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: { xs: 4, sm: 6 } }}>
        {dict.discover}
      </Typography>

      <Stack spacing={{ xs: 4, sm: 6 }}>
        {pickUpMap && (
          <Box component="section">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Explore color="secondary" />
              <Typography variant="subtitle1">{dict['pick up']}</Typography>
            </Box>

            <PickUpMap map={pickUpMap} />
          </Box>
        )}

        {recentReviews.length > 0 && (
          <Box component="section">
            <SectionHeading
              icon={<FiberNew color="secondary" />}
              title={dict['recent pins']}
              href={localePath(lang, '/reports')}
              linkLabel={dict['see all']}
            />

            <ReviewGridList reviews={recentReviews} />
          </Box>
        )}

        {recentChapters.length > 0 && (
          <Box component="section">
            <SectionHeading
              icon={<HistoryEdu color="secondary" />}
              title={dict['recent chapters']}
              href={localePath(lang, '/chapters')}
              linkLabel={dict['see all']}
            />

            <ChapterList chapters={recentChapters} />
          </Box>
        )}

        {activeMaps.length > 0 && (
          <Box component="section">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Whatshot color="secondary" />
              <Typography variant="subtitle1">{dict['active maps']}</Typography>
            </Box>

            <MapGridList maps={activeMaps} />
          </Box>
        )}

        {recentMaps.length > 0 && (
          <Box component="section">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FiberNew color="secondary" />
              <Typography variant="subtitle1">{dict['recent maps']}</Typography>
            </Box>

            <MapGridList maps={recentMaps} />
          </Box>
        )}
      </Stack>
    </>
  );
}
