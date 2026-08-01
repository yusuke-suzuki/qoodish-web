import { cookies, headers } from 'next/headers';

type ApiFetchOptions = RequestInit & {
  guest?: boolean;
  lang?: string;
  timeoutMs?: number;
  next?: { revalidate?: number | false; tags?: string[] };
};

const DEFAULT_TIMEOUT_MS = 15000;

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('__session')?.value ?? null;
}

async function getAcceptLanguage(lang?: string): Promise<string> {
  if (lang) {
    return lang;
  }

  const headerStore = await headers();
  return headerStore.get('accept-language')?.split(',')[0] ?? 'en';
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { guest, lang, timeoutMs, next, ...fetchOptions } = options;

  const token = guest ? null : await getAuthToken();
  const acceptLanguage = await getAcceptLanguage(lang);

  const apiPath = !guest && token ? path : `/guest${path}`;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': acceptLanguage,
    'Content-Type': 'application/json'
  };

  if (token && !guest) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${process.env.API_ENDPOINT}${apiPath}`, {
      ...fetchOptions,
      signal:
        fetchOptions.signal ??
        AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS),
      headers: {
        ...requestHeaders,
        ...Object.fromEntries(new Headers(fetchOptions.headers).entries())
      },
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
