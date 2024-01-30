import { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { Locale, getDictionary, i18n } from '../../i18n';
import SWRProvider from './swr-provider';

export const viewport: Viewport = {
  themeColor: '#ffc107'
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params: { lang }
}: { params: { lang: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(lang);
  const image =
    lang === 'ja'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_ENDPOINT),
    manifest: '/app.webmanifest',
    title: {
      template: '%s | Qoodish',
      default: 'Qoodish'
    },
    description: dict['meta description'],
    openGraph: {
      title: {
        template: '%s | Qoodish',
        default: 'Qoodish'
      },
      description: dict['meta description'],
      url: process.env.NEXT_PUBLIC_ENDPOINT,
      siteName: 'Qoodish',
      images: image,
      locale: lang.replace(/-/g, '_'),
      type: 'website'
    },
    robots: {
      index: process.env.NEXT_PUBLIC_ENDPOINT.includes('dev') ? false : true,
      googleBot: {
        index: process.env.NEXT_PUBLIC_ENDPOINT.includes('dev') ? false : true
      }
    },
    icons: {
      icon: [
        {
          url: new URL(
            '/qoodish.appspot.com/assets/favicon_x32.webp',
            process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT
          ),
          sizes: '32x32',
          type: 'image/webp'
        },
        {
          url: new URL(
            '/qoodish.appspot.com/assets/favicon_x16.webp',
            process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT
          ),
          sizes: '16x16',
          type: 'image/webp'
        }
      ],
      apple: [
        {
          url: new URL(
            '/qoodish.appspot.com/assets/touch-icon-iphone.png',
            process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT
          ),
          type: 'image/png'
        },
        {
          url: new URL(
            '/qoodish.appspot.com/assets/touch-icon-ipad.png',
            process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT
          ),
          sizes: '152x152',
          type: 'image/png'
        },
        {
          url: new URL(
            '/qoodish.appspot.com/assets/touch-icon-iphone-retina.png',
            process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT
          ),
          sizes: '180x180',
          type: 'image/png'
        },
        {
          url: new URL(
            '/qoodish.appspot.com/assets/touch-icon-ipad-retina.png',
            process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT
          ),
          sizes: '167x167',
          type: 'image/png'
        }
      ]
    },
    keywords: [
      'Qoodish',
      'グルメ',
      '食事',
      'マップ',
      '地図',
      '旅行',
      '観光',
      'maps',
      'travel',
      'food',
      'trip'
    ]
  };
}

export default function RootLayout({
  children,
  params: { lang }
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={lang}>
      <body>
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
