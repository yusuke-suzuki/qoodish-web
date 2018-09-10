import React from 'react';
import NavBarContainer from '../containers/NavBarContainer';
import BottomNavContainer from '../containers/BottomNavContainer';
import Routes from './Routes';
import SharedDialogs from './SharedDialogs';

import withWidth from '@material-ui/core/withWidth';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import lightBlue from '@material-ui/core/colors/lightBlue';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import firebase from 'firebase/app';
import 'firebase/auth';
import Helmet from 'react-helmet';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: amber[300],
      main: amber[500],
      dark: amber[700],
      contrastText: '#fff'
    },
    secondary: {
      light: lightBlue[300],
      main: lightBlue[500],
      dark: lightBlue[700],
      contrastText: '#fff'
    }
  }
});

const styles = {
  progressContainer: {
    top: '50%',
    left: '50%',
    position: 'absolute',
    transform: 'translate(-50%, -50%)'
  }
};

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      waitForInitialize: true
    };
    this.retryCount = 0;
    this.maxRetryCount = 20;
  }

  componentWillMount() {
    this.props.handleWindowSizeChange(this.props.width);
    this.retryCount = 0;
    this.setTimerForInitialize();

    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await this.props.signInAnonymously();
      } else {
        if (!user.isAnonymous) {
          this.props.fetchPostableMaps();
        }
      }
    });
  }

  componentWillReceiveProps(props) {
    this.props.handleWindowSizeChange(props.width);
  }

  setTimerForInitialize() {
    if (!this.state.waitForInitialize) {
      return;
    }
    const timer = setInterval(() => {
      console.log('Wait for initialize...');
      this.waitForCurrentUser(timer);
      this.retryCount++;
    }, 1000);
  }

  async waitForCurrentUser(timer) {
    const currentUser = firebase.auth().currentUser;
    if (currentUser || this.retryCount > this.maxRetryCount) {
      clearInterval(timer);
      this.setState({
        waitForInitialize: false
      });
      if (!currentUser.isAnonymous) {
        this.props.initMessaging(this.props.notificationPermitted);
      }
    }
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  render() {
    this.scrollTop();
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          {this.renderHelmet()}
          {this.renderLayout()}
          <SharedDialogs />
        </div>
      </MuiThemeProvider>
    );
  }

  renderHelmet() {
    return (
      <Helmet
        title="Qoodish"
        link={[
          { rel: "canonical", href: process.env.ENDPOINT }
        ]}
        meta={[
          { name: 'title', content: 'Qoodish' },
          { name: 'keywords', content: 'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip'},
          { name: 'theme-color', content: '#ffc107' },
          {
            name: 'description',
            content:
              'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
          },
          { name: 'twitter:card', content: 'summary' },
          { name: 'twitter:title', content: 'Qoodish' },
          {
            name: 'twitter:description',
            content:
              'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
          },
          { name: 'twitter:image', content: process.env.SUBSTITUTE_URL },
          { property: 'og:site_name', content: 'Qoodish - マップベースド SNS' },
          { property: 'og:title', content: 'Qoodish' },
          { property: 'og:type', content: 'website' },
          {
            property: 'og:url',
            content: process.env.ENDPOINT
          },
          { property: 'og:image', content: process.env.SUBSTITUTE_URL },
          {
            property: 'og:description',
            content:
              'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
          },
          { 'http-equiv': 'content-language', content: window.currentLocale }
        ]}
        script={[
          {
            type: 'application/ld+json',
            innerHTML:(JSON.stringify({
              '@context': 'http://schema.org',
              '@type': 'WebSite',
              'name': 'Qoodish',
              'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id':  process.env.ENDPOINT
              },
              'headline': 'Qoodish | マップベースド SNS',
              'image': {
                '@type': 'ImageObject',
                'url': process.env.ICON_512,
                'width': 512,
                'height': 512
              },
              'datePublished': '',
              'dateModified': '',
              'author': {
                '@type': 'Person',
                'name': ''
              },
              'publisher': {
                '@type': 'Organization',
                'name': 'Qoodish',
                'logo': {
                  '@type': 'ImageObject',
                  'url': process.env.ICON_512,
                  'width': 512,
                  'height': 512
                }
              },
              'description': 'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
            }))
          }
        ]}
      />
    );
  }

  renderLayout() {
    if (this.state.waitForInitialize) {
      return (
        <div style={styles.progressContainer}>
          <Typography
            variant={this.props.large ? 'display3' : 'display2'}
            color="primary"
            gutterBottom
          >
            Qoodish
          </Typography>
          <LinearProgress />
        </div>
      );
    } else {
      return (
        <div>
          <Grid container>
            <Grid item xs={12} sm={12} md={3} lg={2} xl={2}>
              <NavBarContainer />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={this.sideNavUnnecessary() ? 12 : 6}
              lg={this.sideNavUnnecessary() ? 12 : 8}
              xl={this.sideNavUnnecessary() ? 12 : 8}
            >
              <Routes />
            </Grid>
          </Grid>
          {!this.props.large && !this.sideNavUnnecessary() && <BottomNavContainer />}
        </div>
      );
    }
  }

  sideNavUnnecessary() {
    const path = this.props.pathname;
    return (
      (path.includes('/maps/') && !path.includes('/reports')) ||
      path.includes('/login') ||
      path.includes('/terms') ||
      path.includes('/privacy')
    );
  }
}

export default withWidth()(App);
