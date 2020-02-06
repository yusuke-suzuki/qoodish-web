import getFirebase from './getFirebase';
import getFirebaseMessaging from './getFirebaseMessaging';
import createRegistrationToken from './createRegistrationToken';
import deleteRegistrationToken from './deleteRegistrationToken';
import detectCurrentLocale from './detectCurrentLocale';
import I18n from './I18n';

const initializeApp = async () => {
  const firebase = await getFirebase();

  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
  firebase.initializeApp(config);

  I18n.locale = detectCurrentLocale();

  if ('serviceWorker' in navigator && 'PushManager' in window) {
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
  }
};

export default initializeApp;
