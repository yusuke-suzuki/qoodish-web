type ApiFetchOptions = RequestInit & {
  guest?: boolean;
  lang?: string;
  timeoutMs?: number;
  next?: { revalidate?: number | false; tags?: string[] };
};

type PerformApiFetchOptions = RequestInit & {
  token: string | null;
  acceptLanguage: string;
  timeoutMs?: number;
  next?: { revalidate?: number | false; tags?: string[] };
};

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

const DEFAULT_TIMEOUT_MS = 15000;

// Imported lazily: `next` ships no exports map, so a static specifier fails
// Node's strict ESM resolution when this module runs under the test runner.
async function getAuthToken(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('__session')?.value ?? null;
}

async function getAcceptLanguage(lang?: string): Promise<string> {
  if (lang) {
    return lang;
  }

  const { headers } = await import('next/headers');
  const headerStore = await headers();
  return headerStore.get('accept-language')?.split(',')[0] ?? 'en';
}

// The transport half of apiFetch: everything below the request-context
// lookups, so it stays callable outside a Next.js request scope.
export async function performApiFetch<T>(
  path: string,
  options: PerformApiFetchOptions
): Promise<ApiResult<T>> {
  const { token, acceptLanguage, timeoutMs, next, ...fetchOptions } = options;

  const apiPath = token ? path : `/guest${path}`;

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

  new Headers(fetchOptions.headers).forEach((value, name) => {
    requestHeaders.set(name, value);
  });

  try {
    const res = await fetch(`${process.env.API_ENDPOINT}${apiPath}`, {
      ...fetchOptions,
      signal:
        fetchOptions.signal ??
        AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS),
      headers: requestHeaders,
      next
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const detail = body?.detail ?? `Request failed with status ${res.status}`;
      return { data: null, error: detail, status: res.status };
    }

    if (res.status === 204) {
      return { data: null, error: null, status: res.status };
    }

    const data = await res.json();
    return { data, error: null, status: res.status };
  } catch (error) {
    console.error(`API fetch error for ${path}:`, error);

    const timedOut =
      error instanceof DOMException && error.name === 'TimeoutError';

    return {
      data: null,
      error: timedOut ? 'Request timed out' : 'Network error',
      status: 0
    };
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiResult<T>> {
  const { guest, lang, ...fetchOptions } = options;

  const token = guest ? null : await getAuthToken();
  const acceptLanguage = await getAcceptLanguage(lang);

  return performApiFetch<T>(path, { ...fetchOptions, token, acceptLanguage });
}

export async function apiFetchOrThrow<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { data, error } = await apiFetch<T>(path, options);

  if (error || data === null) {
    throw new Error(error ?? 'Unknown error');
  }

  return data;
}

// A missing resource must stay distinguishable from an unreachable API:
// detail pages translate null into notFound(), and serving 404s for
// timeouts or 5xx would let crawlers deindex live content.
export function assertApiAvailable(status: number, path: string): void {
  if (status === 0 || status >= 500) {
    throw new Error(`API request for ${path} failed with status ${status}`);
  }
}
