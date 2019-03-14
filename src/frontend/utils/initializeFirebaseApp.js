import getFirebase from './getFirebase';
import getFirebaseMessaging from './getFirebaseMessaging';
import I18n from './I18n';

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
    initializeServiceWorker(firebase);
  }
};

const initializeServiceWorker = async firebase => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  console.log(
    'ServiceWorker registration successful with scope: ',
    registration.scope
  );
  console.log(navigator.serviceWorker);

  await getFirebaseMessaging();
  const messaging = firebase.messaging();

  messaging.onMessage(payload => {
    console.log('Message received. ', payload);

    registration.showNotification(
      notificationTitle(payload.data),
      notificationOptions(payload.data)
    );
  });
};

const notificationTitle = data => {
  return 'Qoodish';
};

const notificationOptions = data => {
  return {
    body: notificationBody(data),
    icon: data.icon,
    click_action: data.click_action,
    color: '#ffc107',
    badge: data.badge
  };
};

const notificationBody = data => {
  const message = I18n.t(`${data.key} ${data.notifiable_type}`);
  return `${data.notifier_name} ${message}`;
};

export default initializeFirebaseApp;
