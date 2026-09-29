import { mock } from 'node:test';
import type { ApiResult } from '../lib/api.ts';
import type { AnalyticsEvent } from '../utils/analyticsEvent.ts';

type ApiFetch = (
  path: string,
  options?: RequestInit
) => Promise<ApiResult<unknown>>;

export type ApiRequest = {
  path: string;
  method: string | undefined;
  body: unknown;
};

export const apiFetch = mock.fn<ApiFetch>();
export const revalidateTags =
  mock.fn<(tags: (string | null | undefined)[]) => void>();
export const recordEvent = mock.fn<(event: AnalyticsEvent) => void>();

mock.module(new URL('../lib/api.ts', import.meta.url).href, {
  namedExports: { apiFetch }
});
mock.module(new URL('../lib/events.ts', import.meta.url).href, {
  namedExports: { recordEvent }
});
mock.module(new URL('../lib/revalidate.ts', import.meta.url).href, {
  namedExports: { revalidateTags }
});

export function respondWith(data: unknown, status = 200): void {
  apiFetch.mock.mockImplementation(async () => ({ data, error: null, status }));
}

export function failWith(error = 'Forbidden', status = 403): void {
  apiFetch.mock.mockImplementation(async () => ({
    data: null,
    error,
    status
  }));
}

export function resetServerActionMocks(): void {
  apiFetch.mock.resetCalls();
  revalidateTags.mock.resetCalls();
  recordEvent.mock.resetCalls();
  respondWith(null, 204);
}

export function apiRequests(): ApiRequest[] {
  return apiFetch.mock.calls.map(({ arguments: [path, options] }) => ({
    path,
    method: options?.method,
    body:
      typeof options?.body === 'string' ? JSON.parse(options.body) : undefined
  }));
}

export function revalidatedTags(): string[] {
  return revalidateTags.mock.calls
    .flatMap(({ arguments: [tags] }) => tags)
    .filter((tag): tag is string => Boolean(tag));
}

export function recordedEvents(): AnalyticsEvent[] {
  return recordEvent.mock.calls.map(({ arguments: [event] }) => event);
}
