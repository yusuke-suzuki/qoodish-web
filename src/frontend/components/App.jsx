import React, { useEffect, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import { withRouter } from 'react-router-dom';
import loadable from '@loadable/component';

const Routes = loadable(() =>
  import(/* webpackChunkName: "routes" */ './Routes')
);
const NavBar = loadable(() =>
  import(/* webpackChunkName: "nav_bar" */ './organisms/NavBar')
);
const BottomNav = loadable(() =>
  import(/* webpackChunkName: "bottom_nav" */ './molecules/BottomNav')
);
const SharedDialogs = loadable(() =>
  import(/* webpackChunkName: "shared_dialogs" */ './SharedDialogs')
);

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import lightBlue from '@material-ui/core/colors/lightBlue';
import Grid from '@material-ui/core/Grid';

import Helmet from 'react-helmet';

import getCurrentUser from '../utils/getCurrentUser';
import locationChange from '../actions/locationChange';
import ApiClient from '../utils/ApiClient';
import fetchMyProfile from '../actions/fetchMyProfile';
import updateLinkedProviders from '../actions/updateLinkedProviders';
import getFirebase from '../utils/getFirebase';
import getFirebaseAuth from '../utils/getFirebaseAuth';
import getFirebaseMessaging from '../utils/getFirebaseMessaging';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import signIn from '../actions/signIn';

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

const scrollTop = () => {
  window.scrollTo(0, 0);
};

const pushApiAvailable = () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    return true;
  } else {
    console.log('Push notification API is not available in this browser.');
    return false;
  }
};

const AppHelmet = () => {
  return (
    <Helmet
      title="Qoodish"
      link={[{ rel: 'canonical', href: process.env.ENDPOINT }]}
      meta={[
        { name: 'title', content: 'Qoodish' },
        {
          name: 'keywords',
          content:
            'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip'
        },
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
          innerHTML: JSON.stringify({
            '@context': 'http://schema.org',
            '@type': 'WebSite',
            name: 'Qoodish',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': process.env.ENDPOINT
            },
            headline: 'Qoodish | マップベースド SNS',
            image: {
              '@type': 'ImageObject',
              url: process.env.ICON_512,
              width: 512,
              height: 512
            },
            datePublished: '',
            dateModified: '',
            author: {
              '@type': 'Person',
              name: ''
            },
            publisher: {
              '@type': 'Organization',
              name: 'Qoodish',
              logo: {
                '@type': 'ImageObject',
                url: process.env.ICON_512,
                width: 512,
                height: 512
              }
            },
            description:
              'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。'
          })
        }
      ]}
    />
  );
};

const Layout = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      showSideNav: state.shared.showSideNav,
      showBottomNav: state.shared.showBottomNav
    }),
    []
  );
  const { showSideNav, showBottomNav } = useMappedState(mapState);

  return (
    <div>
      <Grid container>
        <Grid item xs={12} sm={12} md={3} lg={2} xl={2}>
          <NavBar />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={!large || !showSideNav ? 12 : 6}
          lg={!large || !showSideNav ? 12 : 8}
          xl={!large || !showSideNav ? 12 : 8}
        >
          <Routes />
        </Grid>
      </Grid>
      {!large && showBottomNav && <BottomNav />}
    </div>
  );
};

const App = props => {
  const dispatch = useDispatch();

  const signInAnonymously = useCallback(async (firebaseUser = null) => {
    if (!firebaseUser) {
      const firebase = await getFirebase();
      await getFirebaseAuth();

      await firebase.auth().signInAnonymously();
      firebaseUser = firebase.auth().currentUser;
    }
    const user = {
      uid: firebaseUser.uid,
      isAnonymous: true
    };
    dispatch(signIn(user));
  });

  const initMessaging = useCallback(async firebaseUser => {
    const client = new ApiClient();
    const response = await client.fetchUser();
    if (response.ok) {
      const user = await response.json();
      dispatch(fetchMyProfile(user));
      let linkedProviders = firebaseUser.providerData.map(provider => {
        return provider.providerId;
      });
      dispatch(updateLinkedProviders(linkedProviders));

      if (!user.push_enabled) {
        console.log('Push notification is prohibited.');
        return;
      }
    } else {
      console.log('Fetch profile failed.');
      return;
    }

    const firebase = await getFirebase();
    await getFirebaseMessaging();
    const messaging = firebase.messaging();

    messaging.onMessage(payload => {
      console.log('Message received. ', payload);
    });

    messaging.onTokenRefresh(async () => {
      console.log('Registration token was refreshed.');
      const refreshedToken = await messaging.getToken();
      if (!refreshedToken) {
        console.log('Unable to get registration token.');
        return;
      }
      dispatch(fetchRegistrationToken(refreshedToken));
      const response = await client.sendRegistrationToken(refreshedToken);
      if (!response.ok) {
        console.log('Failed to send registration token.');
      }
    });
  });

  const authenticateUser = useCallback(async () => {
    let firebaseUser = await getCurrentUser();
    if (firebaseUser) {
      if (firebaseUser.isAnonymous) {
        await signInAnonymously(firebaseUser);
      } else if (pushApiAvailable()) {
        initMessaging(firebaseUser);
      }
    } else {
      await signInAnonymously();
    }
  });

  useEffect(() => {
    authenticateUser();
    scrollTop();
  }, []);

  useEffect(
    () => {
      dispatch(locationChange(props.location));
    },
    [props.location]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <div>
        <AppHelmet />
        <Layout />
        <SharedDialogs />
      </div>
    </MuiThemeProvider>
  );
};

export default React.memo(withRouter(App));
