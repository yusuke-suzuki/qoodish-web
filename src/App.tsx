import React, { useEffect, useCallback, useLayoutEffect } from 'react';
import { useDispatch } from 'redux-react-hook';

const Layout = React.lazy(() =>
  import(/* webpackChunkName: "layout" */ './Layout')
);

import AppHelmet from './AppHelmet';

import fetchMyProfile from './actions/fetchMyProfile';
import signIn from './actions/signIn';

import getFirebase from './utils/getFirebase';
import getFirebaseAuth from './utils/getFirebaseAuth';

import { ApiClient, UsersApi } from '@yusuke-suzuki/qoodish-api-js-client';
import locationChange from './actions/locationChange';
import { useHistory } from '@yusuke-suzuki/rize-router';

const App = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    initUser();
  }, []);

  useLayoutEffect(() => {
    dispatch(locationChange(history.location));
  }, [dispatch]);

  const initUser = useCallback(async () => {
    const firebase = await getFirebase();
    await getFirebaseAuth();

    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        await initializeApiClient(user);

        if (user.isAnonymous) {
          signInAnonymously(user);
        } else {
          initProfile(user);
        }
      } else {
        await firebase.auth().signInAnonymously();
      }
    });
  }, []);

  const signInAnonymously = useCallback(
    firebaseUser => {
      const user = {
        uid: firebaseUser.uid,
        isAnonymous: true
      };
      dispatch(signIn(user));
    },
    [dispatch]
  );

  const initProfile = useCallback(
    async firebaseUser => {
      const apiInstance = new UsersApi();

      apiInstance.usersUserIdGet(firebaseUser.uid, (error, data, response) => {
        if (response.ok) {
          dispatch(fetchMyProfile(response.body));
        } else {
          console.log('Fetch profile failed.');
        }
      });
    },
    [dispatch]
  );

  const refreshFirebaseToken = useCallback(async firebaseUser => {
    console.log('Firebase token was refreshed.');
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await firebaseUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
  }, []);

  const initializeApiClient = useCallback(async firebaseUser => {
    const defaultClient = ApiClient.instance;
    defaultClient.basePath = process.env.API_ENDPOINT;
    await refreshFirebaseToken(firebaseUser);

    setInterval(() => {
      refreshFirebaseToken(firebaseUser);
    }, 1800000);
  }, []);

  return (
    <div>
      <AppHelmet />
      <React.Suspense fallback={null}>
        <Layout />
      </React.Suspense>
    </div>
  );
};

export default React.memo(App);
