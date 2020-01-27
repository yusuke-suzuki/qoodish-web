import * as core from 'workbox-core';
import * as precaching from 'workbox-precaching';
import * as googleAnalytics from 'workbox-google-analytics';
import * as routing from 'workbox-routing';
import * as strategies from 'workbox-strategies';
import * as expiration from 'workbox-expiration';

core.skipWaiting();
core.clientsClaim();
precaching.precacheAndRoute(self.__precacheManifest || [], {
  directoryIndex: null
});
googleAnalytics.initialize();

routing.registerRoute(
  new RegExp('https://fonts.googleapis.com'),
  new strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets'
  })
);

routing.registerRoute(
  new RegExp('https://storage.cloud.google.com'),
  new strategies.CacheFirst({
    cacheName: 'storage-cloud-google-images',
    plugins: [
      new expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
      })
    ]
  })
);

import I18n from './I18n';

self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install');
});

self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activate');
});

self.addEventListener('fetch', e => {
  //console.log(e.request.url);
});

self.addEventListener('push', e => {
  const payload = eventToPayload(e);

  self.registration.showNotification(
    notificationTitle(payload.data),
    notificationOptions(payload.data)
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const clickAction = e.notification.data.click_action;
  if (clickAction) {
    e.waitUntil(clients.openWindow(clickAction));
  }
});

const eventToPayload = e => {
  if (!e.data) {
    return null;
  } else {
    return e.data.json();
  }
};

const notificationTitle = data => {
  return 'Qoodish';
};

const notificationOptions = data => {
  return {
    body: notificationBody(data),
    icon: data.icon,
    color: '#ffc107',
    data: {
      click_action: data.click_action
    }
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
