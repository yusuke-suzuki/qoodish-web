import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse
} from 'next/server';
import { isTimeoutError } from './lib/apiRequest.ts';
import { ANALYTICS_COOKIE, analyticsAllowed } from './utils/analyticsRegion.ts';
import describeError from './utils/describeError.ts';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
  PAGE_LOCALE_HEADER,
  pathLocale,
  rememberedOrPreferredLocale
} from './utils/locales.ts';

const WARMUP_INTERVAL_MS = 60000;

// Module state resets with every fresh runtime instance, so this throttle is
// best-effort: each new instance pings once immediately. The healthcheck
// renders a constant string, so those extra pings are cheap; the throttle
// only keeps warm instances from pinging on every request.
let lastWarmupAt = 0;

async function warmUpApi(): Promise<void> {
  try {
    // The response is irrelevant — the connection alone starts the boot, so
    // the timeout only bounds how long this background task lingers.
    await fetch(`${process.env.API_ENDPOINT}/healthcheck`, {
      signal: AbortSignal.timeout(10000)
    });
  } catch (error) {
    console.warn(
      `API warmup request failed [${isTimeoutError(error) ? 'timeout' : 'network'}]: ${describeError(error)}`
    );
  }
}

function visitorCountry(): string | undefined {
  try {
    return getCloudflareContext().cf?.country;
  } catch {
    return undefined;
  }
}

function withAnalyticsFlag(request: NextRequest, response: NextResponse) {
  const allowed = analyticsAllowed(
    visitorCountry(),
    process.env.NODE_ENV === 'development'
  );

  if (allowed) {
    response.cookies.set(ANALYTICS_COOKIE, '1', {
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:'
    });
  } else if (request.cookies.has(ANALYTICS_COOKIE)) {
    response.cookies.delete(ANALYTICS_COOKIE);
  }

  return response;
}

function servePage(request: NextRequest, locale: Locale): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PAGE_LOCALE_HEADER, locale);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: LOCALE_COOKIE_MAX_AGE
    });
  }

  return withAnalyticsFlag(request, response);
}

function redirectToLocale(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const locale = rememberedOrPreferredLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get('accept-language')
  );
  const newUrl = request.nextUrl.clone();
  // '/' must not become '/en/', which Next would 308 again to '/en'.
  newUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  // Redirect instead of rewriting so every page is reachable under exactly one
  // URL; serving locale-less paths with a 200 duplicates every localized page.
  const response = NextResponse.redirect(newUrl, 307);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Vary', 'Accept-Language, Cookie');

  return response;
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const locale = pathLocale(request.nextUrl.pathname);

  if (!locale) {
    return redirectToLocale(request);
  }

  if (Date.now() - lastWarmupAt >= WARMUP_INTERVAL_MS) {
    lastWarmupAt = Date.now();
    event.waitUntil(warmUpApi());
  }

  return servePage(request, locale);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)', '/(en|ja)/:path*']
};
