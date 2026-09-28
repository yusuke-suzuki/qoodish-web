import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { BRAND_COLOR, BRAND_COLOR_CONTRAST } from '../utils/brand.ts';
import {
  isLocale,
  LOCALE_COOKIE,
  PAGE_LOCALE_HEADER,
  rememberedOrPreferredLocale
} from '../utils/locales.ts';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: 'noindex'
};

const messages = {
  en: {
    title: 'Page Not Found',
    description:
      "Looks like you've followed a broken link or entered a URL that doesn't exist on this site.",
    back: 'Back to our site'
  },
  ja: {
    title: 'ページが見つかりません',
    description:
      '壊れたリンクをたどったか、このサイトに存在しないURLを入力したようです。',
    back: 'サイトに戻る'
  }
} as const;

export default async function GlobalNotFound() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const pageLocale = headersList.get(PAGE_LOCALE_HEADER);
  const lang = isLocale(pageLocale)
    ? pageLocale
    : rememberedOrPreferredLocale(
        cookieStore.get(LOCALE_COOKIE)?.value,
        headersList.get('accept-language')
      );
  const m = messages[lang];

  return (
    <html lang={lang}>
      <head>
        <meta name="theme-color" content={BRAND_COLOR} />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          color: '#333'
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {m.title}
          </h1>
          <p
            style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem' }}
          >
            {m.description}
          </p>
          <a
            href={`/${lang}/discover`}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: BRAND_COLOR,
              color: BRAND_COLOR_CONTRAST,
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            {m.back}
          </a>
        </div>
      </body>
    </html>
  );
}
