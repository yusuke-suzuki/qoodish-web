import { skipWaiting, clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import * as googleAnalytics from 'workbox-google-analytics';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

import I18n from './utils/I18n';

cleanupOutdatedCaches();
skipWaiting();
clientsClaim();

precacheAndRoute(self.__precacheManifest || self.__WB_MANIFEST, {
  directoryIndex: null
});

googleAnalytics.initialize();

registerRoute(
  new RegExp('https://fonts.googleapis.com'),
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets'
  })
);

registerRoute(
  new RegExp('https://storage.googleapis.com'),
  new CacheFirst({
    cacheName: 'storage-googleapis-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
      })
    ]
  })
);

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
