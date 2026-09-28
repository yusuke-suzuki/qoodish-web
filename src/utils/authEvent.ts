import type { AnalyticsEvent, AuthMethod } from './analytics.ts';

export function authEvent(
  isNewUser: boolean,
  method: AuthMethod
): AnalyticsEvent {
  return { name: isNewUser ? 'sign_up' : 'login', params: { method } };
}
