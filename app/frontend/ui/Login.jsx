import React from 'react';
import firebase from 'firebase';
import Typography from '@material-ui/core/Typography';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import PlaceIcon from '@material-ui/icons/Place';
import ExploreIcon from '@material-ui/icons/Explore';
import amber from '@material-ui/core/colors/amber';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { Link } from 'react-router-dom';
import I18n from '../containers/I18n';
import FacebookProvider, { Page } from 'react-facebook';

const styles = {
  toolbar: {
    alignSelf: 'center'
  },
  logo: {
    color: 'white',
    cursor: 'pointer'
  },
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
    marginTop: 20
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

class Login extends React.Component {
  componentWillMount() {
    this.uiConfig = {
      callbacks: {
        signInSuccess: (currentUser, credential, redirectUrl) => {
          this.props.signIn(currentUser, credential, redirectUrl);
        }
      },
      signInFlow: 'popup',
      signInSuccessUrl: process.env.ENDPOINT,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID
      ],
      tosUrl: process.env.ENDPOINT
    };

    gtag('config', process.env.GA_TRACKING_ID, {
      'page_path': '/login',
      'page_title': 'Login | Qoodish'
    });
  }

  handleScrollTopClick() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div>
        <AppBar position="fixed">
          <Toolbar style={styles.toolbar}>
            <Typography
              variant="title"
              color="inherit"
              style={styles.logo}
              onClick={this.handleScrollTopClick}
            >
              Qoodish
            </Typography>
          </Toolbar>
        </AppBar>
        <div
          style={
            this.props.large
              ? styles.carouselContainerLarge
              : styles.carouselContainerSmall
          }
        >
          <GridList cols={1} spacing={0} cellHeight={500}>
            <GridListTile key="carousel">
              <img src={process.env.LP_CAROUSEL_1} />
              <GridListTileBar
                title={
                  <Typography
                    variant="display3"
                    color="inherit"
                    style={styles.carouselTileBarText}
                    gutterBottom
                  >
                    {I18n.t('expand your map')}
                  </Typography>
                }
                subtitle={
                  <div>
                    <Typography
                      variant="headline"
                      color="inherit"
                      style={styles.carouselTileBarText}
                    >
                      <span>{I18n.t('where are you going next')}</span>
                    </Typography>
                    <div style={styles.firebaseContainer}>
                      <StyledFirebaseAuth
                        uiConfig={this.uiConfig}
                        firebaseAuth={firebase.auth()}
                      />
                    </div>
                  </div>
                }
                style={styles.carouselTileBar}
              />
            </GridListTile>
          </GridList>
        </div>
        <div
          style={
            this.props.large
              ? styles.loginContainerLarge
              : styles.loginContainerSmall
          }
        >
          <Grid container style={styles.gridContainer} spacing={24}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Card style={styles.descriptionCard}>
                <CardContent>
                  <Typography gutterBottom>
                    <PlaceIcon style={styles.descriptionIcon} />
                  </Typography>
                  <Typography variant="display1" gutterBottom>
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
                  <Typography variant="display1" gutterBottom>
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
          <Button
            variant="fab"
            onClick={this.handleScrollTopClick}
            style={styles.scrollTopButton}
          >
            <ArrowUpwardIcon />
          </Button>
        </div>
        <Card>
          <CardContent style={styles.bottomCardContent}>
            <div
              style={
                this.props.large ? styles.containerLarge : styles.containerSmall
              }
            >
              <Grid container style={styles.gridContainer} spacing={24}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  {this.renderFbPage()}
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <div><Link to="/terms">{I18n.t('terms of service')}</Link></div>
                  <div><Link to="/privacy">{I18n.t('privacy policy')}</Link></div>
                  <div><a href="https://github.com/yusuke-suzuki/qoodish-web" target="_blank">GitHub</a></div>
                </Grid>
              </Grid>
            </div>
          </CardContent>
          <CardContent style={styles.bottomCardLicense}>
            <div
              style={
                this.props.large ? styles.containerLarge : styles.containerSmall
              }
            >
              <Typography variant="caption">
                © 2018 Qoodish, All rights reserved.
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  renderFbPage() {
    return (
      <FacebookProvider appId={process.env.FB_APP_ID}>
        <Page href="https://www.facebook.com/qoodish" />
      </FacebookProvider>
    );
  }
}

export default Login;
