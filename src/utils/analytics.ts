import { getApps } from 'firebase/app';
import { hasAnalyticsCookie } from './analyticsRegion.ts';

export type AuthMethod = 'google.com' | 'emailLink';

export type AnalyticsEvent =
  | { name: 'page_view'; params: { page_path: string } }
  | { name: 'sign_up' | 'login'; params: { method: AuthMethod } }
  | { name: 'email_link_sent' }
  | { name: 'link_provider' | 'unlink_provider'; params: { provider: string } }
  | { name: 'create_map'; params: { map_id: number } }
  | { name: 'create_pin'; params: { map_id: number } }
  | { name: 'start_journey' | 'finish_journey'; params: { map_id?: number } }
  | { name: 'create_chapter'; params: { map_id: number } }
  | { name: 'publish_chapter'; params: { chapter_id: number } }
  | {
      name: 'add_comment';
      params: { content_type: 'pin' | 'chapter'; item_id: number };
    }
  | {
      name: 'like';
      params: { content_type: 'pin' | 'chapter' | 'comment'; item_id: number };
    }
  | {
      name: 'follow';
      params:
        | { content_type: 'map'; item_id: number }
        | { content_type: 'journal' };
    }
  | {
      name: 'share';
      params: {
        method: 'copy_link';
        content_type: 'map' | 'pin' | 'chapter';
        item_id: number;
      };
    };

type FirebaseAnalytics = typeof import('firebase/analytics');

let sdk: Promise<FirebaseAnalytics | null> | undefined;

async function loadSupportedSdk() {
  const analytics = await import('firebase/analytics');
  return (await analytics.isSupported()) ? analytics : null;
}

async function send(event: AnalyticsEvent) {
  sdk ??= loadSupportedSdk();
  const analytics = await sdk;

  if (!analytics) return;

  const name: string = event.name;
  analytics.logEvent(
    analytics.getAnalytics(),
    name,
    'params' in event ? event.params : undefined
  );
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || !getApps().length) return;
  if (!hasAnalyticsCookie(document.cookie)) return;

  send(event).catch((error) => {
    console.error('Failed to log analytics event:', error);
  });
}
