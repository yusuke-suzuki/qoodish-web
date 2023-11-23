import { Explore, Place } from '@mui/icons-material';
import {
  Box,
  Card,
  CardMedia,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Layout from '../../components/Layout';
import LoginCard from '../../components/auth/LoginCard';
import Footer from '../../components/layouts/Footer';
import useDictionary from '../../hooks/useDictionary';
import { NextPageWithLayout } from '../_app';

const LoginPage: NextPageWithLayout = () => {
  const dictionary = useDictionary();
  const router = useRouter();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const title = `${dictionary.login} | Qoodish`;
  const description = dictionary['meta description'];
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;
  const thumbnailUrl =
    router.locale === router.defaultLocale
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;

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

      <Box
        sx={{
          display: 'flex',
          position: 'relative'
        }}
      >
        <CardMedia
          component="img"
          image={process.env.NEXT_PUBLIC_LP_CAROUSEL_1}
          width={4592}
          height={2576}
          alt="Qoodish"
          loading="lazy"
          sx={{
            height: mdUp
              ? 'auto'
              : `calc(100dvh - ${smUp ? theme.spacing(8) : theme.spacing(7)})`,
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
            <LoginCard />
          </Container>
        </Box>
      </Box>

      <Container maxWidth="md" sx={{ my: 4 }}>
        <Grid container spacing={10}>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Stack alignItems="center" spacing={2}>
              <Place
                color="primary"
                sx={{
                  fontSize: '6rem'
                }}
              />

              <Typography
                variant={mdUp ? 'h4' : 'h5'}
                component="h2"
                align="center"
              >
                {dictionary['share favorite spot']}
              </Typography>
              <Typography component="p" align="center">
                {dictionary['tell friends spot']}
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

          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Stack alignItems="center" spacing={2}>
              <Explore
                color="primary"
                sx={{
                  fontSize: '6rem'
                }}
              />

              <Typography
                variant={mdUp ? 'h4' : 'h5'}
                component="h2"
                align="center"
              >
                {dictionary['find your best place']}
              </Typography>
              <Typography component="p" align="center">
                {dictionary['surely your friends know']}
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
};

LoginPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout hideBottomNav fullWidth>
      {page}
    </Layout>
  );
};

export default LoginPage;
