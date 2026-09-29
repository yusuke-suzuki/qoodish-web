import type { PrecacheEntry, RuntimeCaching } from 'serwist';
import { NetworkOnly, Serwist, StaleWhileRevalidate } from 'serwist';
import enMessages from '../dictionaries/en.json';
import jaMessages from '../dictionaries/ja.json';
import { LOCALES } from '../utils/locales.ts';
import { notificationMessageKey } from '../utils/notificationMessage.ts';
import { offlinePath, offlinePathFor } from '../utils/offline.ts';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const en: Record<string, string> = enMessages;
const ja: Record<string, string> = jaMessages;

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

const isDocumentRequest = (request: Request) =>
  request.destination === 'document';

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ request }) => isDocumentRequest(request),
    handler: new NetworkOnly()
  },
  {
    matcher: /^https:\/\/fonts\.googleapis\.com\/.*/,
    handler: new StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets'
    })
  }
];

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
  const message = I18n.t(
    notificationMessageKey(data.key, data.notifiable_type)
  );
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
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: LOCALES.map((locale) => ({
      url: offlinePath(locale),
      matcher: ({ request }) =>
        isDocumentRequest(request) &&
        offlinePathFor(request.url, self.navigator.languages) ===
          offlinePath(locale)
    }))
  }
});

serwist.addEventListeners();
