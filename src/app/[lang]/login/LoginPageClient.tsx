'use client';

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
import Layout from '../../../components/Layout';
import LoginCard from '../../../components/auth/LoginCard';
import Footer from '../../../components/layouts/Footer';
import useDictionary from '../../../hooks/useDictionary';

export default function LoginPageClient() {
  const dictionary = useDictionary();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Layout hideBottomNav fullWidth>
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
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 7,
                  md: 8,
                  lg: 8
                }}
                alignContent={smUp ? 'center' : 'flex-end'}
              >
                <Stack spacing={2}>
                  <Typography
                    variant={mdUp ? 'h3' : 'h4'}
                    component="h1"
                    color="white"
                    align="center"
                  >
                    {dictionary['create map together']}
                  </Typography>

                  <Typography
                    variant={mdUp ? 'subtitle1' : 'subtitle2'}
                    component="p"
                    color="white"
                    align="center"
                  >
                    {dictionary['start new adventure']}
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

          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
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
    </Layout>
  );
}
