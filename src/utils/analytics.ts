import type { Analytics } from 'firebase/analytics';
import { getApp, getApps } from 'firebase/app';
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

type LoadedAnalytics = {
  sdk: typeof import('firebase/analytics');
  instance: Analytics;
};

let loaded: Promise<LoadedAnalytics | null> | undefined;

async function loadSupportedAnalytics(): Promise<LoadedAnalytics | null> {
  const sdk = await import('firebase/analytics');
  if (!(await sdk.isSupported())) return null;
  if (!hasAnalyticsCookie(document.cookie)) return null;

  const instance = sdk.initializeAnalytics(getApp(), {
    config: { send_page_view: false }
  });
  return { sdk, instance };
}

async function send(event: AnalyticsEvent) {
  loaded ??= loadSupportedAnalytics();
  const analytics = await loaded;

  if (!analytics) {
    if (!hasAnalyticsCookie(document.cookie)) loaded = undefined;
    return;
  }

  const { sdk, instance } = analytics;
  const allowed = hasAnalyticsCookie(document.cookie);
  sdk.setAnalyticsCollectionEnabled(instance, allowed);

  if (!allowed) return;

  const name: string = event.name;
  sdk.logEvent(instance, name, 'params' in event ? event.params : undefined);
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || !getApps().length) return;
  if (!loaded && !hasAnalyticsCookie(document.cookie)) return;

  send(event).catch((error) => {
    console.error('Failed to log analytics event:', error);
  });
}
