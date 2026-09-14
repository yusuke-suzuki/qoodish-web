import describeError from '../utils/describeError.ts';
import { getDictionary } from '../utils/getDictionary.ts';
import {
  apiUrl,
  buildApiHeaders,
  DEFAULT_TIMEOUT_MS,
  getAcceptLanguage,
  getAuthToken,
  isTimeoutError
} from './apiRequest.ts';

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

// The error string travels straight into a snackbar, so a failure the API
// never answered is worded in the reader's language like one it did.
function messages(acceptLanguage: string): Record<string, string> {
  return getDictionary(acceptLanguage.split('-')[0]);
}

// The transport half of apiFetch: everything below the request-context
// lookups, so it stays callable outside a Next.js request scope.
export async function performApiFetch<T>(
  path: string,
  options: PerformApiFetchOptions
): Promise<ApiResult<T>> {
  const { token, acceptLanguage, timeoutMs, next, ...fetchOptions } = options;

  const apiPath = token ? path : `/guest${path}`;

  try {
    const res = await fetch(apiUrl(apiPath), {
      ...fetchOptions,
      signal:
        fetchOptions.signal ??
        AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS),
      headers: buildApiHeaders({
        token,
        acceptLanguage,
        headers: fetchOptions.headers
      }),
      next
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const detail =
        body?.detail ?? messages(acceptLanguage)['an error occurred'];
      return { data: null, error: detail, status: res.status };
    }

    if (res.status === 204) {
      return { data: null, error: null, status: res.status };
    }

    const data = await res.json();
    return { data, error: null, status: res.status };
  } catch (error) {
    const timedOut = isTimeoutError(error);

    console.error(
      `API fetch error for ${path} [${timedOut ? 'timeout' : 'network'}]: ${describeError(error)}`
    );

    return {
      data: null,
      error:
        messages(acceptLanguage)[
          timedOut ? 'request timed out' : 'network error'
        ],
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
