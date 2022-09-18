import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import PlaceIcon from '@material-ui/icons/Place';
import ExploreIcon from '@material-ui/icons/Explore';
import amber from '@material-ui/core/colors/amber';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Fab from '@material-ui/core/Fab';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';
import Footer from '../../components/molecules/Footer';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { useLocale } from '../../hooks/useLocale';

const LoginButtons = dynamic(
  () => import('../../components/organisms/LoginButtons'),
  {
    ssr: false
  }
);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loginContainer: {
      textAlign: 'center',
      margin: '0 auto',
      padding: 20,
      [theme.breakpoints.up('lg')]: {
        width: '80%'
      }
    },
    gridContainer: {
      width: '100%',
      margin: 'auto'
    },
    descriptionIcon: {
      width: 150,
      height: 150,
      color: amber[500]
    },
    descriptionCard: {
      height: '100%',
      boxShadow: 'initial',
      backgroundColor: 'initial'
    },
    bottomCardContent: {
      backgroundColor: amber[500]
    },
    bottomCardLicense: {
      backgroundColor: amber[700],
      paddingBottom: theme.spacing(2)
    },
    container: {
      width: '100%',
      margin: '0 auto',
      [theme.breakpoints.up('lg')]: {
        width: '80%'
      }
    },
    image: {
      width: '100%'
    },
    firebaseContainer: {
      marginTop: 20,
      whiteSpace: 'initial'
    },
    carouselContainer: {
      textAlign: 'center',
      width: '100%'
    },
    carouselTileBar: {
      height: '100%',
      background: 'rgba(0, 0, 0, 0.1)'
    },
    carouselTileBarText: {
      whiteSpace: 'initial'
    },
    scrollTopButton: {
      margin: 20
    }
  })
);

const handleScrollTopClick = () => {
  window.scrollTo(0, 0);
};

const Login = () => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();
  const { I18n } = useLocale();
  const router = useRouter();

  const title = `${I18n.t('login')} | Qoodish`;
  const description = I18n.t('meta description');
  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  return (
    <Layout hideBottomNav={true} fullWidth={true}>
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
        <meta
          property="og:image"
          content={process.env.NEXT_PUBLIC_OGP_IMAGE_URL}
        />

        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:locale" content={router.locale} />
        <meta property="og:site_name" content={I18n.t('meta headline')} />
      </Head>

      <div className={classes.carouselContainer}>
        <GridList cols={1} spacing={0} cellHeight={600}>
          <GridListTile key="carousel">
            <img src={process.env.NEXT_PUBLIC_LP_CAROUSEL_1} />
            <GridListTileBar
              title={
                <Typography
                  variant={smUp ? 'h2' : 'h3'}
                  color="inherit"
                  className={classes.carouselTileBarText}
                  gutterBottom
                >
                  {I18n.t('create map together')}
                </Typography>
              }
              subtitle={
                <div>
                  <Typography
                    variant={smUp ? 'h5' : 'h6'}
                    color="inherit"
                    className={classes.carouselTileBarText}
                  >
                    <span>{I18n.t('where are you going next')}</span>
                  </Typography>
                  <div className={classes.firebaseContainer}>
                    <LoginButtons nextPath="/" />
                  </div>
                </div>
              }
              className={classes.carouselTileBar}
            />
          </GridListTile>
        </GridList>
      </div>
      <div className={classes.loginContainer}>
        <Grid container className={classes.gridContainer} spacing={10}>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Card className={classes.descriptionCard}>
              <CardContent>
                <Typography gutterBottom>
                  <PlaceIcon className={classes.descriptionIcon} />
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {I18n.t('share favorite spot')}
                </Typography>
                <Typography component="p" gutterBottom>
                  {I18n.t('tell friends spot')}
                </Typography>
              </CardContent>
              <CardMedia>
                <img
                  src={process.env.NEXT_PUBLIC_LP_IMAGE_1}
                  className={classes.image}
                />
              </CardMedia>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Card className={classes.descriptionCard}>
              <CardContent>
                <Typography gutterBottom>
                  <ExploreIcon className={classes.descriptionIcon} />
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {I18n.t('find your best place')}
                </Typography>
                <Typography component="p" gutterBottom>
                  {I18n.t('surely your friends know')}
                </Typography>
              </CardContent>
              <CardMedia>
                <img
                  src={process.env.NEXT_PUBLIC_LP_IMAGE_2}
                  className={classes.image}
                />
              </CardMedia>
            </Card>
          </Grid>
        </Grid>
        <Fab onClick={handleScrollTopClick} className={classes.scrollTopButton}>
          <ArrowUpwardIcon />
        </Fab>
      </div>
      <Footer />
    </Layout>
  );
};

export default React.memo(Login);
