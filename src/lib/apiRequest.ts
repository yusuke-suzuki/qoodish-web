import {
  isLocale,
  LOCALE_COOKIE,
  PAGE_LOCALE_HEADER
} from '../utils/locales.ts';

export const DEFAULT_TIMEOUT_MS = 15000;

type ApiHeaderOptions = {
  token: string | null;
  acceptLanguage: string;
  headers?: HeadersInit;
};

// Imported lazily: `next` ships no exports map, so a static specifier fails
// Node's strict ESM resolution when this module runs under the test runner.
export async function getAuthToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('__session')?.value ?? null;
}

function quality(params: string[]): number {
  for (const param of params) {
    // A parameter name is case-insensitive, and a 'Q=0' read as no weight at
    // all would let through a language the reader had refused.
    const trimmed = param.trim().toLowerCase();

    if (trimmed.startsWith('q=')) {
      const value = Number.parseFloat(trimmed.slice(2));
      return Number.isFinite(value) ? value : 1;
    }
  }

  return 1;
}

// The Rails API takes one locale, not a q-weighted list. The header is under
// no obligation to be ordered by preference, so the first entry is not
// necessarily the wanted one, and a weight left on the value would reach the
// backend as part of the locale.
export function parseAcceptLanguage(header: string | null): string {
  let best = '';
  let bestQuality = 0;

  for (const entry of header?.split(',') ?? []) {
    const [tag, ...params] = entry.trim().split(';');
    const weight = quality(params);

    // A wildcard names no locale, and a zero weight refuses one.
    if (!tag || tag === '*' || weight <= 0 || weight <= bestQuality) {
      continue;
    }

    best = tag;
    bestQuality = weight;
  }

  return best || 'en';
}

type ApiLanguageSources = {
  pageLocale?: string | null;
  rememberedLocale?: string | null;
  acceptLanguage: string | null;
};

export function resolveApiLanguage({
  pageLocale,
  rememberedLocale,
  acceptLanguage
}: ApiLanguageSources): string {
  if (isLocale(pageLocale)) {
    return pageLocale;
  }

  if (isLocale(rememberedLocale)) {
    return rememberedLocale;
  }

  return parseAcceptLanguage(acceptLanguage);
}

export async function getAcceptLanguage(lang?: string): Promise<string> {
  if (lang) {
    return lang;
  }

  const { cookies, headers } = await import('next/headers');
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);

  return resolveApiLanguage({
    pageLocale: headerStore.get(PAGE_LOCALE_HEADER),
    rememberedLocale: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get('accept-language')
  });
}

export function buildApiHeaders({
  token,
  acceptLanguage,
  headers
}: ApiHeaderOptions): Headers {
  // Headers matches names case-insensitively, so a caller's 'content-type'
  // replaces the default instead of the two being sent comma-joined as one
  // value, which is what merging plain objects by spread produced.
  const requestHeaders = new Headers({
    Accept: 'application/json',
    'Accept-Language': acceptLanguage,
    'Content-Type': 'application/json'
  });

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  new Headers(headers).forEach((value, name) => {
    requestHeaders.set(name, value);
  });

  return requestHeaders;
}

export function apiUrl(path: string): string {
  return `${process.env.API_ENDPOINT}${path}`;
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'TimeoutError';
}
