import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps } from 'firebase/app';

// A funnel needs more than page views: the moments a reader signs up, draws
// a map, leaves a report or publishes a chapter are what the landing page
// is measured against.
export default function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!getApps().length) {
    return;
  }

  try {
    logEvent(getAnalytics(), name, params);
  } catch (error) {
    console.warn('Failed to log analytics event', error);
  }
}
