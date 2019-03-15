import getFirebase from './getFirebase';

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

  if ('serviceWorker' in navigator) {
    initializeServiceWorker();
  }
};

const initializeServiceWorker = async () => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  console.log(
    'ServiceWorker registration successful with scope: ',
    registration.scope
  );
};

export default initializeFirebaseApp;
