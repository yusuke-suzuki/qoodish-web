import React, { useEffect, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

const Layout = React.lazy(() =>
  import(/* webpackChunkName: "layout" */ './Layout')
);
import AppHelmet from './AppHelmet';

import fetchMyProfile from '../actions/fetchMyProfile';
import updateLinkedProviders from '../actions/updateLinkedProviders';
import fetchNotifications from '../actions/fetchNotifications';
import signIn from '../actions/signIn';

import getFirebase from '../utils/getFirebase';
import getFirebaseAuth from '../utils/getFirebaseAuth';

import { ApiClient, UsersApi, NotificationsApi } from 'qoodish_api';

const App = () => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  useEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }
    refreshNotifications();
    refreshProviders();
  }, [currentUser.uid]);

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
  });

  const signInAnonymously = useCallback(firebaseUser => {
    const user = {
      uid: firebaseUser.uid,
      isAnonymous: true
    };
    dispatch(signIn(user));
  });

  const initProfile = useCallback(async firebaseUser => {
    const apiInstance = new UsersApi();

    apiInstance.usersUserIdGet(firebaseUser.uid, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchMyProfile(response.body));
      } else {
        console.log('Fetch profile failed.');
      }
    });
  });

  const refreshFirebaseToken = useCallback(async firebaseUser => {
    console.log('Firebase token was refreshed.');
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await firebaseUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';
  });

  const initializeApiClient = useCallback(async firebaseUser => {
    const defaultClient = ApiClient.instance;
    defaultClient.basePath = process.env.API_ENDPOINT;
    await refreshFirebaseToken(firebaseUser);

    setInterval(() => {
      refreshFirebaseToken(firebaseUser);
    }, 1800000);
  });

  const refreshProviders = useCallback(async () => {
    const firebase = await getFirebase();
    await getFirebaseAuth();
    const firebaseUser = firebase.auth().currentUser;

    const linkedProviders = firebaseUser.providerData.map(provider => {
      return provider.providerId;
    });
    dispatch(updateLinkedProviders(linkedProviders));
  });

  const refreshNotifications = useCallback(async () => {
    const apiInstance = new NotificationsApi();

    apiInstance.notificationsGet((error, data, response) => {
      if (response.ok) {
        dispatch(fetchNotifications(response.body));
      }
    });
  });

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
