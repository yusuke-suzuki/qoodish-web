import React, { useEffect } from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';

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

import I18n from '../../utils/I18n';
import FacebookProvider, { Page } from 'react-facebook';
import LoginButtons from '../organisms/LoginButtons';
import Helmet from 'react-helmet';

const styles = {
  loginContainerLarge: {
    textAlign: 'center',
    width: '80%',
    margin: '0 auto',
    padding: 20
  },
  loginContainerSmall: {
    textAlign: 'center',
    margin: '0 auto',
    padding: 20
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
    paddingBottom: 16
  },
  containerLarge: {
    width: '80%',
    margin: '0 auto'
  },
  containerSmall: {
    width: '100%',
    margin: '0 auto'
  },
  image: {
    width: '100%'
  },
  firebaseContainer: {
    marginTop: 20,
    whiteSpace: 'initial'
  },
  carouselContainerLarge: {
    textAlign: 'center',
    width: '100%',
    paddingTop: 64
  },
  carouselContainerSmall: {
    textAlign: 'center',
    width: '100%',
    paddingTop: 56
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
};

const handleScrollTopClick = () => {
  window.scrollTo(0, 0);
};

const LoginHelmet = () => {
  return (
    <Helmet
      title={`${I18n.t('login')} | Qoodish`}
      link={[{ rel: 'canonical', href: `${process.env.ENDPOINT}/login` }]}
      meta={[
        { name: 'title', content: `${I18n.t('login')} | Qoodish` },
        { property: 'og:title', content: `${I18n.t('login')} | Qoodish` },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: `${process.env.ENDPOINT}/login`
        }
      ]}
    />
  );
};

const FbPage = () => {
  return (
    <FacebookProvider appId={process.env.FB_APP_ID}>
      <Page href="https://www.facebook.com/qoodish" />
    </FacebookProvider>
  );
};

const Login = () => {
  const large = useMediaQuery('(min-width: 600px)');

  useEffect(() => {
    gtag('config', process.env.GA_TRACKING_ID, {
      page_path: '/login',
      page_title: `${I18n.t('login')} | Qoodish`
    });
  }, []);

  return (
    <div>
      <LoginHelmet />
      <div
        style={
          large ? styles.carouselContainerLarge : styles.carouselContainerSmall
        }
      >
        <GridList cols={1} spacing={0} cellHeight={600}>
          <GridListTile key="carousel">
            <img src={process.env.LP_CAROUSEL_1} />
            <GridListTileBar
              title={
                <Typography
                  variant={large ? 'h2' : 'h3'}
                  color="inherit"
                  style={styles.carouselTileBarText}
                  gutterBottom
                >
                  {I18n.t('create map together')}
                </Typography>
              }
              subtitle={
                <div>
                  <Typography
                    variant={large ? 'h5' : 'h6'}
                    color="inherit"
                    style={styles.carouselTileBarText}
                  >
                    <span>{I18n.t('where are you going next')}</span>
                  </Typography>
                  <div style={styles.firebaseContainer}>
                    <LoginButtons />
                  </div>
                </div>
              }
              style={styles.carouselTileBar}
            />
          </GridListTile>
        </GridList>
      </div>
      <div
        style={large ? styles.loginContainerLarge : styles.loginContainerSmall}
      >
        <Grid container style={styles.gridContainer} spacing={24}>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Card style={styles.descriptionCard}>
              <CardContent>
                <Typography gutterBottom>
                  <PlaceIcon style={styles.descriptionIcon} />
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {I18n.t('share favorite spot')}
                </Typography>
                <Typography component="p" gutterBottom>
                  {I18n.t('tell friends spot')}
                </Typography>
              </CardContent>
              <CardMedia>
                <img src={process.env.LP_IMAGE_1} style={styles.image} />
              </CardMedia>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <Card style={styles.descriptionCard}>
              <CardContent>
                <Typography gutterBottom>
                  <ExploreIcon style={styles.descriptionIcon} />
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {I18n.t('find your best place')}
                </Typography>
                <Typography component="p" gutterBottom>
                  {I18n.t('surely your friends know')}
                </Typography>
              </CardContent>
              <CardMedia>
                <img src={process.env.LP_IMAGE_2} style={styles.image} />
              </CardMedia>
            </Card>
          </Grid>
        </Grid>
        <Fab onClick={handleScrollTopClick} style={styles.scrollTopButton}>
          <ArrowUpwardIcon />
        </Fab>
      </div>
      <Card>
        <CardContent style={styles.bottomCardContent}>
          <div style={large ? styles.containerLarge : styles.containerSmall}>
            <Grid container style={styles.gridContainer} spacing={24}>
              <Grid item xs={12} sm={12} md={6} lg={6}>
                <FbPage />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={6}>
                <div>
                  <Link to="/terms">{I18n.t('terms of service')}</Link>
                </div>
                <div>
                  <Link to="/privacy">{I18n.t('privacy policy')}</Link>
                </div>
                <div>
                  <a
                    href="https://github.com/yusuke-suzuki/qoodish-web"
                    target="_blank"
                  >
                    GitHub
                  </a>
                </div>
              </Grid>
            </Grid>
          </div>
        </CardContent>
        <CardContent style={styles.bottomCardLicense}>
          <div style={large ? styles.containerLarge : styles.containerSmall}>
            <Typography variant="caption">
              © 2019 Qoodish, All rights reserved.
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(Login);
