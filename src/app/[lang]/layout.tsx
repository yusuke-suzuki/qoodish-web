import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import type { Notification, Profile } from '../../../types/index.ts';
import JsonLd from '../../components/common/JsonLd.tsx';
import Shell from '../../components/layouts/Shell.tsx';
import ShellProvider from '../../components/layouts/ShellProvider.tsx';
import { getServerAuthState } from '../../lib/auth.ts';
import { getMyProfile, getNotifications } from '../../lib/users.ts';
import { BRAND_COLOR } from '../../utils/brand.ts';
import { getDictionary } from '../../utils/getDictionary.ts';
import { defaultOgImage, ogImages, SITE_ORIGIN } from '../../utils/metadata.ts';
import { siteStructuredData } from '../../utils/structuredData.ts';
import { fontVariables } from '../fonts.ts';
import Providers from './Providers.tsx';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export const viewport: Viewport = {
  themeColor: BRAND_COLOR,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Shrink the layout viewport with the software keyboard. Under the default
  // resizes-visual, fixed-positioned dialogs and app bars get pushed behind it.
  interactiveWidget: 'resizes-content'
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const defaultThumbnailUrl = defaultOgImage(lang);

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: 'Qoodish',
    description: dict['meta description'],
    robots: process.env.APP_ENV !== 'production' ? 'noindex' : undefined,
    icons: {
      icon: [
        { url: '/icons/icon_x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon_x16.png', sizes: '16x16', type: 'image/png' }
      ],
      apple: [
        { url: '/icons/icon_x180.png' },
        { url: '/icons/icon_x152.png', sizes: '152x152' },
        { url: '/icons/icon_x180.png', sizes: '180x180' },
        { url: '/icons/icon_x167.png', sizes: '167x167' }
      ]
    },
    appleWebApp: {
      capable: true,
      title: 'Qoodish',
      statusBarStyle: 'black-translucent'
    },
    openGraph: {
      type: 'website',
      title: 'Qoodish',
      description: dict['meta description'],
      siteName: 'Qoodish',
      images: ogImages(defaultThumbnailUrl, dict['meta headline']),
      locale: lang === 'en' ? 'en_US' : 'ja_JP'
    },
    twitter: {
      card: 'summary_large_image'
    },
    // `other` renders <meta name="...">, which Open Graph parsers ignore.
    other: {
      'twitter:domain': 'qoodish.com',
      'mobile-web-app-capable': 'yes'
    }
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const { authenticated, pending, uid, token } = await getServerAuthState();
  const profilePromise = authenticated
    ? getMyProfile(lang, token)
    : Promise.resolve<Profile | null>(null);
  // The bell is chrome, drawn above every error boundary: an outage there
  // must cost the unread count, not the page.
  const notificationsPromise = authenticated
    ? getNotifications(lang).catch(() => [])
    : Promise.resolve<Notification[]>([]);

  return (
    <html lang={lang} className={fontVariables}>
      <head>
        <link href="https://www.googleapis.com" rel="preconnect dns-prefetch" />
        <link
          href="https://storage.cloud.google.com"
          rel="preconnect dns-prefetch"
        />
        <link
          href="https://storage.googleapis.com"
          rel="preconnect dns-prefetch"
        />
        <JsonLd
          data={siteStructuredData(
            lang,
            dict['meta headline'],
            dict['meta description']
          )}
        />
      </head>
      <body>
        <Providers
          lang={lang}
          serverAuthenticated={authenticated}
          serverPending={pending}
          serverUid={uid}
          profilePromise={profilePromise}
          notificationsPromise={notificationsPromise}
        >
          <ShellProvider>
            <Shell>{children}</Shell>
          </ShellProvider>
        </Providers>
      </body>
    </html>
  );
}
