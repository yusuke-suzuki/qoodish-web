import type { PrecacheEntry, RuntimeCaching } from 'serwist';
import {
  CacheFirst,
  ExpirationPlugin,
  Serwist,
  StaleWhileRevalidate
} from 'serwist';
import en from '../dictionaries/en.json';
import ja from '../dictionaries/ja.json';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const I18n = {
  _locale: 'en',

  set locale(locale: string) {
    this._locale = locale;
  },

  get locale() {
    return this._locale;
  },

  t(key: string): string {
    switch (this._locale) {
      case 'ja':
      case 'ja-JP':
      case 'ja-jp':
        return ja[key] || en[key] || key;
      default:
        return en[key] || key;
    }
  }
};

// Push notification handlers
interface NotificationData {
  key: string;
  notifiable_type: string;
  notifier_name: string;
  notifier_id: string;
  notifiable_id: string;
  notification_id: string;
  icon: string;
  click_action: string;
}

interface PushEventPayload {
  data: NotificationData;
}

// Define runtime caching
const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: /^https:\/\/fonts\.googleapis\.com\/.*/,
    handler: new StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets'
    })
  },
  {
    matcher: /^https:\/\/storage\.googleapis\.com\/.*/,
    handler: new CacheFirst({
      cacheName: 'storage-googleapis-images',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
        })
      ]
    })
  }
];

// Push notification event handlers and helper functions
const eventToPayload = (e: PushEvent): PushEventPayload | null => {
  if (e?.data) {
    return e.data.json();
  }

  return null;
};

const notificationTitle = (_data: NotificationData): string => {
  return 'Qoodish';
};

const notificationBody = (data: NotificationData): string => {
  const message = I18n.t(`${data.key} ${data.notifiable_type}`);
  return `${data.notifier_name} ${message}`;
};

const notificationOptions = (data: NotificationData): NotificationOptions => {
  return {
    body: notificationBody(data),
    icon: data.icon,
    data: {
      click_action: data.click_action
    }
  };
};

self.addEventListener('push', (e: PushEvent) => {
  console.log('[ServiceWorker] Push message received:', e);

  const currentLocale = self.navigator.language;

  I18n.locale = currentLocale;
  console.log('[ServiceWorker] current locale:', I18n.locale);

  const payload = eventToPayload(e);

  if (payload?.data) {
    e.waitUntil(
      self.registration.showNotification(
        notificationTitle(payload.data),
        notificationOptions(payload.data)
      )
    );
  }
});

self.addEventListener('notificationclick', (e: NotificationEvent) => {
  e.notification.close();
  const clickAction = e.notification.data?.click_action;
  if (clickAction) {
    e.waitUntil(self.clients.openWindow(clickAction));
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching
});

serwist.addEventListeners();
