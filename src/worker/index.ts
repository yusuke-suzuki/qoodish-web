import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import * as googleAnalytics from 'workbox-google-analytics';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

const en = require('../dictionaries/en.json');
const ja = require('../dictionaries/ja.json');

const I18n = {
  _locale: 'en',

  set locale(locale) {
    this._locale = locale;
  },

  get locale() {
    return this._locale;
  },

  t(key) {
    switch (this._locale) {
      case 'ja':
      case 'ja-JP':
      case 'ja-jp':
        return ja[key];
      default:
        return en[key];
    }
  }
};

clientsClaim();

googleAnalytics.initialize();

registerRoute(
  /https:\/\/fonts.googleapis.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets'
  })
);

registerRoute(
  /https:\/\/storage.googleapis.com/,
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

self.addEventListener('install', (e) => {
  console.log('[ServiceWorker] Install');

  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  console.log('[ServiceWorker] Activate');

  cleanupOutdatedCaches();
});

self.addEventListener('fetch', (e) => {
  // console.log(e.request.url);
});

self.addEventListener('push', (e) => {
  console.log('[ServiceWorker] Push message received:', e);

  const currentLocale = self.navigator.language;

  I18n.locale = currentLocale;
  console.log('[ServiceWorker] current locale:', I18n.locale);

  const payload = eventToPayload(e);

  self.registration.showNotification(
    notificationTitle(payload.data),
    notificationOptions(payload.data)
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const clickAction = e.notification.data.click_action;
  if (clickAction) {
    e.waitUntil(self.clients.openWindow(clickAction));
  }
});

const eventToPayload = (e) => {
  if (e?.data) {
    console.log(e.data);
    return e.data.json();
  }
  return null;
};

const notificationTitle = (_data) => {
  return 'Qoodish';
};

const notificationOptions = (data) => {
  return {
    body: notificationBody(data),
    icon: data.icon,
    color: '#ffc107',
    data: {
      click_action: data.click_action
    }
  };
};

const notificationBody = (data) => {
  const message = I18n.t(`${data.key} ${data.notifiable_type}`);
  return `${data.notifier_name} ${message}`;
};
