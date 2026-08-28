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

// The Rails API takes one locale, not a q-weighted list.
export function parseAcceptLanguage(header: string | null): string {
  return header?.split(',')[0] ?? 'en';
}

export async function getAcceptLanguage(lang?: string): Promise<string> {
  if (lang) {
    return lang;
  }

  const { headers } = await import('next/headers');
  const headerStore = await headers();
  return parseAcceptLanguage(headerStore.get('accept-language'));
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
