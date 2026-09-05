import { Explore, Place } from '@mui/icons-material';
import {
  Box,
  Card,
  CardMedia,
  Container,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import type { Metadata } from 'next';
import LoginCard from '../../../components/auth/LoginCard.tsx';
import Footer from '../../../components/layouts/Footer.tsx';
import { getDictionary } from '../../../utils/getDictionary.ts';
import { localePath } from '../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../utils/metadata.ts';

const HERO_IMAGE_URL =
  'https://storage.googleapis.com/qoodish.appspot.com/assets/qoodish-lp-carousel-1-2019-05-06.jpg';
const SHARE_FEATURE_IMAGE_URL =
  'https://storage.googleapis.com/qoodish.appspot.com/assets/qoodish-lp-map-detail-2019-05-06.png';
const DISCOVER_FEATURE_IMAGE_URL =
  'https://storage.googleapis.com/qoodish.appspot.com/assets/qoodish-lp-discover-2019-05-06.png';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.login} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/login'),
    openGraph: {
      type: 'website',
      title,
      description,
      url: localePath(lang, '/login'),
      images: ogImages(thumbnailUrl),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function LoginPage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <>
      <Box sx={{ display: 'flex', position: 'relative' }}>
        <CardMedia
          component="img"
          image={HERO_IMAGE_URL}
          width={4592}
          height={2576}
          alt="Qoodish"
          loading="lazy"
          sx={{
            height: {
              xs: 'calc(100dvh - 56px)',
              sm: 'calc(100dvh - 64px)',
              md: 'auto'
            },
            width: '100%'
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'grid',
            placeContent: 'center',
            background: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <Container maxWidth="md">
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 7,
                  md: 8,
                  lg: 8
                }}
                sx={{ alignContent: { xs: 'flex-end', sm: 'center' } }}
              >
                <Stack spacing={2}>
                  <Typography
                    variant="h4"
                    component="h1"
                    color="white"
                    align="center"
                    sx={{ typography: { md: 'h3' } }}
                  >
                    {dict['create map together']}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    component="p"
                    color="white"
                    align="center"
                    sx={{ typography: { md: 'h6' } }}
                  >
                    {dict['start new adventure']}
                  </Typography>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 5, md: 4, lg: 4 }}>
                <LoginCard />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ my: 4 }}>
        <Grid container spacing={10}>
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Stack alignItems="center" spacing={2}>
              <Place
                color="primary"
                sx={{
                  fontSize: '6rem'
                }}
              />

              <Typography
                variant="h5"
                component="h2"
                align="center"
                sx={{ typography: { md: 'h4' } }}
              >
                {dict['share favorite spot']}
              </Typography>
              <Typography component="p" align="center">
                {dict['tell friends spot']}
              </Typography>

              <Card>
                <CardMedia
                  component="img"
                  image={SHARE_FEATURE_IMAGE_URL}
                  width={2878}
                  height={1578}
                  alt="Qoodish"
                  loading="lazy"
                  sx={{
                    height: 'auto',
                    width: '100%'
                  }}
                />
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Stack alignItems="center" spacing={2}>
              <Explore
                color="primary"
                sx={{
                  fontSize: '6rem'
                }}
              />

              <Typography
                variant="h5"
                component="h2"
                align="center"
                sx={{ typography: { md: 'h4' } }}
              >
                {dict['find your best place']}
              </Typography>
              <Typography component="p" align="center">
                {dict['surely your friends know']}
              </Typography>

              <Card>
                <CardMedia
                  component="img"
                  image={DISCOVER_FEATURE_IMAGE_URL}
                  width={2878}
                  height={1578}
                  alt="Qoodish"
                  loading="lazy"
                  sx={{
                    height: 'auto',
                    width: '100%'
                  }}
                />
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
}
