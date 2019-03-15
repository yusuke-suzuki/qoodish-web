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

import getCurrentUser from '../utils/getCurrentUser';
import getFirebase from '../utils/getFirebase';
import getFirebaseAuth from '../utils/getFirebaseAuth';
import initializeApiClient from '../utils/initializeApiClient';

import { UsersApi, NotificationsApi } from 'qoodish_api';
import createRegistrationToken from '../utils/createRegistrationToken';

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

  useEffect(
    () => {
      if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
        return;
      }
      createRegistrationToken();
      refreshNotifications();
      refreshProviders();
    },
    [currentUser.uid]
  );

  const initUser = useCallback(async () => {
    let firebaseUser = await getCurrentUser();

    if (firebaseUser && !firebaseUser.isAnonymous) {
      initProfile(firebaseUser);
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

  const initProfile = useCallback(async firebaseUser => {
    await initializeApiClient();
    const apiInstance = new UsersApi();

    apiInstance.usersUserIdGet(firebaseUser.uid, (error, data, response) => {
      if (response.ok) {
        dispatch(fetchMyProfile(response.body));
      } else {
        console.log('Fetch profile failed.');
      }
    });
  });

  const refreshProviders = useCallback(async () => {
    const firebaseUser = await getCurrentUser();
    const linkedProviders = firebaseUser.providerData.map(provider => {
      return provider.providerId;
    });
    dispatch(updateLinkedProviders(linkedProviders));
  });

  const refreshNotifications = useCallback(async () => {
    await initializeApiClient();
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
