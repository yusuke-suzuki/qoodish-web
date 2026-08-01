import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse
} from 'next/server';

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

const locales = ['en', 'ja'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';

function getPreferredLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferred = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase());

  for (const lang of preferred) {
    if (locales.includes(lang as Locale)) {
      return lang as Locale;
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (Date.now() - lastWarmupAt >= WARMUP_INTERVAL_MS) {
    lastWarmupAt = Date.now();
    event.waitUntil(warmUpApi());
  }

  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getPreferredLocale(request);
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${locale}${pathname}`;

  if (locale === defaultLocale) {
    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)']
};
