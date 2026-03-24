import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './Providers';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export const metadata: Metadata = {
  other: {
    'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
    'og:type': 'website',
    'og:site_name': 'Qoodish',
    'twitter:domain': 'qoodish.com'
  }
};

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <head>
        <link rel="manifest" href="/app.webmanifest" />

        <link
          rel="icon"
          type="image/webp"
          sizes="32x32"
          href="https://storage.googleapis.com/qoodish.appspot.com/assets/favicon_x32.webp"
        />
        <link
          rel="icon"
          type="image/webp"
          sizes="16x16"
          href="https://storage.googleapis.com/qoodish.appspot.com/assets/favicon_x16.webp"
        />
        <link
          rel="apple-touch-icon"
          href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-iphone.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-iphone-retina.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-ipad-retina.png"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="preconnect dns-prefetch stylesheet"
        />

        <link href="https://www.googleapis.com" rel="preconnect dns-prefetch" />
        <link
          href="https://www.google-analytics.com"
          rel="preconnect dns-prefetch"
        />
        <link
          href="https://storage.cloud.google.com"
          rel="preconnect dns-prefetch"
        />
        <link
          href="https://storage.googleapis.com"
          rel="preconnect dns-prefetch"
        />
        <link
          rel="stylesheet preconnect dns-prefetch"
          href="https://unpkg.com/react-spring-bottom-sheet/dist/style.css"
          crossOrigin="anonymous"
        />

        <meta name="theme-color" content="#ffc107" />

        {process.env.NEXT_PUBLIC_ENDPOINT?.includes('dev') && (
          <meta name="googlebot" content="noindex" />
        )}
      </head>
      <body>
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
