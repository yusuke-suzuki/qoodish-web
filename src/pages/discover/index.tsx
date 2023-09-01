import { Explore, FiberNew, Whatshot } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Layout from '../../components/Layout';
import PickUpMap from '../../components/discover/PickUpMap';
import MapGridList from '../../components/maps/MapGridList';
import ReviewGridList from '../../components/reviews/ReviewGridList';
import { useActiveMaps } from '../../hooks/useActiveMaps';
import useDictionary from '../../hooks/useDictionary';
import { useRecentMaps } from '../../hooks/useRecentMaps';
import { useRecentReviews } from '../../hooks/useRecentReviews';
import { NextPageWithLayout } from '../_app';

const DiscoverPage: NextPageWithLayout = () => {
  const router = useRouter();
  const dictionary = useDictionary();

  const title = `${dictionary.discover} | Qoodish`;
  const description = dictionary['meta description'];
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const thumbnailUrl =
    router.locale === router.defaultLocale
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;

  const { reviews: recentReviews } = useRecentReviews();
  const { maps: activeMaps } = useActiveMaps();
  const { maps: recentMaps } = useRecentMaps();

  return (
    <>
      <Head>
        <title>{title}</title>

        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
          hrefLang="en"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}/ja${router.pathname}`}
          hrefLang="ja"
        />
        <link
          rel="alternate"
          href={`${process.env.NEXT_PUBLIC_ENDPOINT}${router.pathname}`}
          hrefLang="x-default"
        />

        <meta
          name="keywords"
          content="Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip"
        />
        <meta name="title" content={title} />
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_ENDPOINT}${basePath}${router.pathname}`}
        />
        <meta property="og:image" content={thumbnailUrl} />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={dictionary['meta headline']} />
      </Head>

      <Stack spacing={4} divider={<Divider />}>
        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Explore color="secondary" />
            <Typography variant="subtitle1">{dictionary['pick up']}</Typography>
          </Box>

          <PickUpMap />
        </Box>

        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FiberNew color="secondary" />
            <Typography variant="subtitle1">
              {dictionary['recent reports']}
            </Typography>
          </Box>

          <ReviewGridList reviews={recentReviews} />
        </Box>

        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Whatshot color="secondary" />
            <Typography variant="subtitle1">
              {dictionary['active maps']}
            </Typography>
          </Box>

          <MapGridList maps={activeMaps} />
        </Box>

        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FiberNew color="secondary" />
            <Typography variant="subtitle1">
              {dictionary['recent maps']}
            </Typography>
          </Box>

          <MapGridList maps={recentMaps} />
        </Box>
      </Stack>
    </>
  );
};

DiscoverPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default DiscoverPage;
