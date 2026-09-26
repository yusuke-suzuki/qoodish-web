import { raw } from 'hono/html';
import type { Child } from 'hono/jsx';
import { dictionaryFor, type Locale, otherLocale } from '../i18n/index.ts';

type Props = {
  locale: Locale;
  title: string;
  path: string;
  children: Child;
};

export function Layout({ locale, title, path, children }: Props) {
  const dict = dictionaryFor(locale);
  const other = otherLocale(locale);

  return (
    <>
      {raw('<!DOCTYPE html>')}
      <html lang={locale}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex, nofollow" />
          <title>{`${title} | ${dict.appName}`}</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
          <header class="site-header">
            <a class="brand" href={`/${locale}/reports`}>
              {dict.appName}
            </a>
            <a href={`/${other}${path}`} hreflang={other} lang={other}>
              {dict.switchLanguage}
            </a>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </>
  );
}
