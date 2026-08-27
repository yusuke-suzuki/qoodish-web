import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse
} from 'next/server';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './utils/locales.ts';

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
    console.warn('API warmup request failed:', error);
  }
}

function getPreferredLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferred = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase());

  for (const lang of preferred) {
    if (LOCALES.includes(lang as Locale)) {
      return lang as Locale;
    }
  }
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    if (Date.now() - lastWarmupAt >= WARMUP_INTERVAL_MS) {
      lastWarmupAt = Date.now();
      event.waitUntil(warmUpApi());
    }

    return NextResponse.next();
  }

  const locale = getPreferredLocale(request);
  const newUrl = request.nextUrl.clone();
  // '/' must not become '/en/', which Next would 308 again to '/en'.
  newUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  // Redirect instead of rewriting so every page is reachable under exactly one
  // URL; serving locale-less paths with a 200 duplicates every localized page.
  return NextResponse.redirect(newUrl, 308);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)']
};
