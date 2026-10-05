import { env } from 'cloudflare:workers';
import { type AnalyticsEvent, toDataPoint } from '../utils/analyticsEvent.ts';

export function recordEvent(event: AnalyticsEvent): void {
  env.ANALYTICS_EVENTS.writeDataPoint(toDataPoint(event));
}
