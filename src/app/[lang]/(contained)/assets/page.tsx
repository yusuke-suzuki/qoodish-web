import type { Metadata } from 'next';
import AssetGenerator from '../../../../components/assets/AssetGenerator.tsx';
import { getDictionary } from '../../../../utils/getDictionary.ts';
import { localePath } from '../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const description = dict['meta description'];
  const thumbnailUrl = defaultOgImage(lang);

  return {
    title: 'Assets | Qoodish',
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/assets'),
    openGraph: {
      type: 'website',
      title: 'Assets | Qoodish',
      description,
      url: localePath(lang, '/assets'),
      images: ogImages(thumbnailUrl),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline']
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function AssetsPage({ params }: Props) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return <AssetGenerator lang={lang} tagline={dict['create map together']} />;
}
