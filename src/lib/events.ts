import { getCloudflareContext } from '@opennextjs/cloudflare';
import { type AnalyticsEvent, toDataPoint } from '../utils/analyticsEvent.ts';

export function recordEvent(event: AnalyticsEvent): void {
  getCloudflareContext().env.ANALYTICS_EVENTS?.writeDataPoint(
    toDataPoint(event)
  );
}
