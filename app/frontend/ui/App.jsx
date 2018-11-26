import React from 'react';
import NavBarContainer from '../containers/NavBarContainer';
import BottomNavContainer from '../containers/BottomNavContainer';
import Routes from './Routes';
import ToastContainer from '../containers/ToastContainer';
import BlockUiContainer from '../containers/BlockUiContainer';
import SharedDialogs from './SharedDialogs';

import withWidth from '@material-ui/core/withWidth';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import lightBlue from '@material-ui/core/colors/lightBlue';
import Grid from '@material-ui/core/Grid';

import Helmet from 'react-helmet';

import { getCurrentUser } from '../containers/Utils';

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
  },
  typography: {
    useNextVariants: true
  }
});

const pushApiAvailable = () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    return true;
  } else {
    console.log('Push notification API is not available in this browser.');
    return false;
  }
};

class App extends React.PureComponent {
  async componentDidMount() {
    this.props.handleWindowSizeChange(this.props.width);
    this.props.handleLocationChange(this.props.location);

    let firebaseUser = await getCurrentUser();
    if (firebaseUser) {
      if (firebaseUser.isAnonymous) {
        await this.props.signInAnonymously(firebaseUser);
      } else if (pushApiAvailable()) {
        this.props.initMessaging();
      }
    } else {
      await this.props.signInAnonymously();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.props.handleLocationChange(this.props.location);
    }
    if (this.props.width !== prevProps.width) {
      this.props.handleWindowSizeChange(this.props.width);
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
          <ToastContainer />
          <BlockUiContainer />
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
            md={!this.props.large || !this.props.showSideNav ? 12 : 6}
            lg={!this.props.large || !this.props.showSideNav ? 12 : 8}
            xl={!this.props.large || !this.props.showSideNav ? 12 : 8}
          >
            <Routes />
          </Grid>
        </Grid>
        {!this.props.large && this.props.showBottomNav && <BottomNavContainer />}
      </div>
    );
  }
}

export default withWidth()(App);
