import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import OfflineProviders from '../../../components/offline/OfflineProviders.tsx';
import { THEME_COLOR } from '../../../utils/brand.ts';
import { getDictionary } from '../../../utils/getDictionary.ts';
import { LOCALES } from '../../../utils/locales.ts';
import { fontVariables } from '../../fonts.ts';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: `${getDictionary(lang).offline} - Qoodish`,
    robots: 'noindex'
  };
}

export default async function OfflineLayout({ children, params }: Props) {
  const { lang } = await params;

  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <OfflineProviders lang={lang} dictionary={getDictionary(lang)}>
          {children}
        </OfflineProviders>
      </body>
    </html>
  );
}
