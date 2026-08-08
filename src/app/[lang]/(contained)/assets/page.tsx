import type { Metadata } from 'next';
import AssetGenerator from '../../../../components/assets/AssetGenerator';
import { getDictionary } from '../../../../utils/getDictionary';
import { localePath } from '../../../../utils/locales';
import { buildAlternates } from '../../../../utils/metadata';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const description = dict['meta description'];
  const thumbnailUrl =
    lang === 'en'
      ? process.env.NEXT_PUBLIC_OGP_IMAGE_URL_EN
      : process.env.NEXT_PUBLIC_OGP_IMAGE_URL_JA;

  return {
    title: 'Assets | Qoodish',
    description,
    keywords:
      'Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, maps, travel, food, group, trip',
    alternates: buildAlternates(lang, '/assets'),
    openGraph: {
      title: 'Assets | Qoodish',
      description,
      url: localePath(lang, '/assets'),
      images: [{ url: thumbnailUrl }],
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
