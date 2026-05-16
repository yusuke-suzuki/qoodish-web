import { Box } from '@mui/material';
import type { Metadata, Viewport } from 'next';
import { Lobster } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Notification, Profile } from '../../../types';
import MiniDrawer from '../../components/layouts/MiniDrawer';
import MobileAppBar from '../../components/layouts/MobileAppBar';
import ShellProvider from '../../components/layouts/ShellProvider';
import { getServerAuthState } from '../../lib/auth';
import { getNotifications, getProfile } from '../../lib/users';
import { getDictionary } from '../../utils/getDictionary';
import Providers from './Providers';

const lobster = Lobster({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-lobster',
  display: 'swap'
});

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export const viewport: Viewport = {
  themeColor: '#ffc107',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
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
    robots: process.env.VERCEL_ENV !== 'production' ? 'noindex' : undefined,
    icons: {
      icon: [
        {
          url: 'https://storage.googleapis.com/qoodish.appspot.com/assets/favicon_x32.webp',
          sizes: '32x32',
          type: 'image/webp'
        },
        {
          url: 'https://storage.googleapis.com/qoodish.appspot.com/assets/favicon_x16.webp',
          sizes: '16x16',
          type: 'image/webp'
        }
      ],
      apple: [
        {
          url: 'https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-iphone.png'
        },
        {
          url: 'https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-ipad.png',
          sizes: '152x152'
        },
        {
          url: 'https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-iphone-retina.png',
          sizes: '180x180'
        },
        {
          url: 'https://storage.googleapis.com/qoodish.appspot.com/assets/touch-icon-ipad-retina.png',
          sizes: '167x167'
        }
      ]
    },
    appleWebApp: {
      capable: true,
      title: 'Qoodish',
      statusBarStyle: 'black-translucent'
    },
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
      'twitter:domain': 'qoodish.com',
      'mobile-web-app-capable': 'yes'
    }
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  const { authenticated, uid, token } = await getServerAuthState();
  const profilePromise =
    authenticated && uid
      ? getProfile(uid, lang, token)
      : Promise.resolve<Profile | null>(null);
  const notificationsPromise = authenticated
    ? getNotifications(lang)
    : Promise.resolve<Notification[]>([]);

  return (
    <html lang={lang} className={lobster.variable}>
      <head>
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
