import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse
} from 'next/server';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './utils/locales';

const WARMUP_INTERVAL_MS = 60000;

let lastWarmupAt = 0;

async function warmUpApi(): Promise<void> {
  try {
    await fetch(`${process.env.API_ENDPOINT}/healthcheck`, {
      signal: AbortSignal.timeout(60000)
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
  if (Date.now() - lastWarmupAt >= WARMUP_INTERVAL_MS) {
    lastWarmupAt = Date.now();
    event.waitUntil(warmUpApi());
  }

  const { pathname } = request.nextUrl;

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
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
