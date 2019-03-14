// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.6/firebase-messaging.js');

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

  return self.registration.showNotification(
    notificationTitle(payload.data),
    notificationOptions(payload.data)
  );
});

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
  const currentLocale =
    self.navigator.language ||
    self.navigator.userLanguage ||
    self.navigator.browserLanguage;

  const message = I18n.t(`${data.key} ${data.notifiable_type}`, currentLocale);
  return `${data.notifier_name} ${message}`;
};
