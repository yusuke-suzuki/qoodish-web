import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch } from 'redux-react-hook';

import loadable from '@loadable/component';

const Layout = loadable(() =>
  import(/* webpackChunkName: "layout" */ './Layout')
);

import Helmet from 'react-helmet';

import ApiClient from '../utils/ApiClient';
import fetchMyProfile from '../actions/fetchMyProfile';
import updateLinkedProviders from '../actions/updateLinkedProviders';
import fetchNotifications from '../actions/fetchNotifications';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import signIn from '../actions/signIn';

import getCurrentUser from '../utils/getCurrentUser';
import getFirebase from '../utils/getFirebase';
import getFirebaseAuth from '../utils/getFirebaseAuth';
import getFirebaseMessaging from '../utils/getFirebaseMessaging';

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

const App = () => {
  const dispatch = useDispatch();

  const initMessaging = useCallback(async () => {
    if (!pushApiAvailable()) {
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

  const initProfile = useCallback(async () => {
    const client = new ApiClient();
    const response = await client.fetchUser();
    if (response.ok) {
      const user = await response.json();
      dispatch(fetchMyProfile(user));
      let firebaseUser = await getCurrentUser();
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
  });

  const refreshNotifications = useCallback(async () => {
    const client = new ApiClient();
    let response = await client.fetchNotifications();
    if (response.ok) {
      let notifications = await response.json();
      dispatch(fetchNotifications(notifications));
    }
  });

  const initUser = useCallback(async () => {
    let firebaseUser = await getCurrentUser();

    if (firebaseUser && !firebaseUser.isAnonymous) {
      initProfile();
      initMessaging();
      refreshNotifications();
      return;
    }

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

  useEffect(() => {
    initUser();
  }, []);

  return (
    <div>
      <AppHelmet />
      <Layout />
    </div>
  );
};

export default React.memo(App);
