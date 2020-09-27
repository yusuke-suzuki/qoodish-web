import React, {
  useEffect,
  useCallback,
  useLayoutEffect,
  useState
} from 'react';
import { useDispatch } from 'redux-react-hook';

const Layout = React.lazy(() =>
  import(/* webpackChunkName: "layout" */ './Layout')
);

import AppHelmet from './AppHelmet';

import fetchMyProfile from './actions/fetchMyProfile';
import { ApiClient, UsersApi } from '@yusuke-suzuki/qoodish-api-js-client';
import locationChange from './actions/locationChange';
import { useHistory } from '@yusuke-suzuki/rize-router';
import firebase, { User } from 'firebase/app';
import 'firebase/auth';
import I18n from './utils/I18n';
import getFirebaseMessaging from './utils/getFirebaseMessaging';
import deleteRegistrationToken from './utils/deleteRegistrationToken';
import createRegistrationToken from './utils/createRegistrationToken';
import AuthContext from './context/AuthContext';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const dispatch = useDispatch();
  const history = useHistory();

  const initFirebase = useCallback(() => {
    firebase.initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DB_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    });
  }, []);

  const initServiceWorker = useCallback(async () => {
    const { Workbox } = await import('workbox-window');
    const wb = new Workbox('/sw.js');
    const registration = await wb.register();

    console.log(
      'ServiceWorker registration successful with scope: ',
      registration.scope
    );

    await getFirebaseMessaging();
    const messaging = firebase.messaging();
    messaging.useServiceWorker(registration);

    messaging.onTokenRefresh(async () => {
      console.log('Registration token was refreshed.');
      deleteRegistrationToken();
      createRegistrationToken();
    });
  }, []);

  const initLocale = useCallback(() => {
    const parsedUrl = new URL(window.location.href);
    const hl = parsedUrl.searchParams.get('hl');

    I18n.locale =
      hl ||
      window.navigator.language ||
      window.navigator.userLanguage ||
      window.navigator.browserLanguage;
  }, []);

  const initApiClient = useCallback(() => {
    const defaultClient = ApiClient.instance;
    defaultClient.basePath = process.env.API_ENDPOINT;
  }, []);

  const getProfile = useCallback(
    async firebaseUser => {
      const apiInstance = new UsersApi();
      const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
      firebaseAuth.apiKey = await firebaseUser.getIdToken();
      firebaseAuth.apiKeyPrefix = 'Bearer';

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

  useEffect(() => {
    if (!firebase.apps.length) {
      initFirebase();
    }

    initLocale();
    initApiClient();

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      initServiceWorker();
    }

    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);

        if (!user.isAnonymous) {
          getProfile(user);
        }
      } else {
        firebase.auth().signInAnonymously();
      }
    });

    return () => unsubscribe();
  }, []);

  useLayoutEffect(() => {
    dispatch(locationChange(history.location));
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser,
        setCurrentUser: setCurrentUser
      }}
    >
      <AppHelmet />
      <React.Suspense fallback={null}>
        <Layout />
      </React.Suspense>
    </AuthContext.Provider>
  );
};

export default React.memo(App);
