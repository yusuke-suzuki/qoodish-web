// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

import I18n from './I18n';

firebase.initializeApp({
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(payload => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  const currentLocale =
    self.navigator.language ||
    self.navigator.userLanguage ||
    self.navigator.browserLanguage;

  const notificationOptions = {
    body: notificationBody(payload.data, currentLocale),
    icon: payload.data.icon,
    click_action: payload.data.click_action
  };

  return self.registration.showNotification(
    notificationTitle(payload.data),
    notificationOptions
  );
});

const notificationTitle = data => {
  return 'Qoodish';
};

const notificationBody = (data, currentLocale) => {
  const message = I18n.t(`${data.key} ${data.notifiable_type}`, currentLocale);
  return `${data.notifier_name} ${message}`;
};
