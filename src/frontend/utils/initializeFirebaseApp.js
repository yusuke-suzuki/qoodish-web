import getFirebase from './getFirebase';
import getFirebaseMessaging from './getFirebaseMessaging';
import createRegistrationToken from './createRegistrationToken';
import deleteRegistrationToken from './deleteRegistrationToken';

const initializeFirebaseApp = async () => {
  const firebase = await getFirebase();

  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
  };
  firebase.initializeApp(config);

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    initializeServiceWorker(firebase);
  }
};

const initializeServiceWorker = async firebase => {
  const registration = await navigator.serviceWorker.register('/sw.js');
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
};

export default initializeFirebaseApp;
