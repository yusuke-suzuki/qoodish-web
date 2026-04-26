import { Box } from '@mui/material';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import MiniDrawer from '../../components/layouts/MiniDrawer';
import MobileAppBar from '../../components/layouts/MobileAppBar';
import ShellProvider from '../../components/layouts/ShellProvider';
import { getServerAuthState } from '../../lib/auth';
import { getNotifications, getProfile } from '../../lib/users';
import { getDictionary } from '../../utils/getDictionary';
import Providers from './Providers';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const defaultThumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;

  return {
    title: 'Qoodish',
    description: dict['meta description'],
    robots: process.env.NEXT_PUBLIC_ENDPOINT?.includes('dev')
      ? 'noindex'
      : undefined,
    openGraph: {
      title: 'Qoodish',
      description: dict['meta description'],
      siteName: 'Qoodish',
      images: [{ url: defaultThumbnailUrl }],
      locale: lang === 'en' ? 'en_US' : 'ja_JP'
    },
    twitter: {
      card: 'summary_large_image'
    },
    other: {
      'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
      'og:type': 'website',
      'og:site_name': 'Qoodish',
      'twitter:domain': 'qoodish.com'
    }
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  const { authenticated, uid, token } = await getServerAuthState();
  const profilePromise =
    authenticated && uid ? getProfile(uid, lang, token) : Promise.resolve(null);
  const notificationsPromise = authenticated
    ? getNotifications(lang)
    : Promise.resolve([]);

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
        <meta name="theme-color" content="#ffc107" />
      </head>
      <body>
        <Providers
          lang={lang}
          serverAuthenticated={authenticated}
          serverUid={uid}
          profilePromise={profilePromise}
          notificationsPromise={notificationsPromise}
        >
          <ShellProvider>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <MobileAppBar />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <MiniDrawer />
            </Box>
            <Box
              component="main"
              sx={{
                pl: { md: 8 },
                pt: { xs: 7, sm: 8, md: 0 }
              }}
            >
              {children}
            </Box>
          </ShellProvider>
        </Providers>
      </body>
    </html>
  );
}
