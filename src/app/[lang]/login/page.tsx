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
import LoginCard from '../../../components/auth/LoginCard';
import Footer from '../../../components/layouts/Footer';
import { getDictionary } from '../../../utils/getDictionary';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const title = `${dict.login} | Qoodish`;
  const description = dict['meta description'];
  const thumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;
  const endpoint = `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;

  return {
    title,
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: {
      canonical: `${endpoint}/${lang}/login`,
      languages: {
        en: `${endpoint}/en/login`,
        ja: `${endpoint}/ja/login`,
        'x-default': `${endpoint}/en/login`
      }
    },
    openGraph: {
      title,
      description,
      url: `${endpoint}/${lang}/login`,
      images: [{ url: thumbnailUrl }],
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
          image={process.env.NEXT_PUBLIC_LP_CAROUSEL_1}
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
                    variant="subtitle2"
                    component="p"
                    color="white"
                    align="center"
                    sx={{ typography: { md: 'subtitle1' } }}
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
                  image={process.env.NEXT_PUBLIC_LP_IMAGE_1}
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
                  image={process.env.NEXT_PUBLIC_LP_IMAGE_2}
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
