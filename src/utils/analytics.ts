import type { AnalyticsEvent } from './analyticsEvent.ts';

const ENDPOINT = '/api/events';

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify(event);

  if (navigator.sendBeacon?.(ENDPOINT, body)) return;

  fetch(ENDPOINT, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true
  }).catch((error) => {
    console.error('Failed to send analytics event:', error);
  });
}
