import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PinDetail from '../../../../../components/pins/PinDetail.tsx';
import { getServerAuthState } from '../../../../../lib/auth.ts';
import { getPin } from '../../../../../lib/pins.ts';
import { getDictionary } from '../../../../../utils/getDictionary.ts';
import { localePath } from '../../../../../utils/locales.ts';
import {
  buildAlternates,
  defaultOgImage,
  ogImages
} from '../../../../../utils/metadata.ts';

type Props = {
  params: Promise<{ lang: string; pinId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, pinId } = await params;
  const dict = getDictionary(lang);
  const pin = await getPin(pinId, lang);

  const title = pin ? `${pin.name} - ${pin.map.name} | Qoodish` : 'Qoodish';
  const description = pin ? pin.comment : dict['meta description'];
  const keywords = `${
    pin ? `${pin.map.name}, ${pin.name}, ` : ''
  }Qoodish, qoodish, 食べ物, グルメ, 食事, マップ, 地図, 友だち, グループ, 旅行, 観光, 観光スポット, maps, travel, food, group, trip`;
  const thumbnailUrl =
    pin && pin.images.length > 0 ? pin.images[0].ogp : defaultOgImage(lang);
  const path = `/pins/${pinId}`;

  return {
    title,
    description,
    keywords,
    robots: !pin || pin.map.private ? 'noindex' : undefined,
    alternates: buildAlternates(lang, path),
    openGraph: {
      type: 'article',
      title,
      description,
      url: localePath(lang, path),
      images: ogImages(thumbnailUrl, pin?.name ?? dict['meta headline']),
      locale: lang === 'en' ? 'en_US' : 'ja_JP',
      siteName: dict['meta headline'],
      publishedTime: pin?.created_at,
      modifiedTime: pin?.updated_at
    },
    twitter: {
      card: 'summary_large_image'
    }
  };
}

export default async function PinPage({ params }: Props) {
  const { lang, pinId } = await params;
  const { token } = await getServerAuthState();
  const pin = await getPin(pinId, lang, token);

  if (!pin) {
    notFound();
  }

  return (
    <Suspense>
      <PinDetail pin={pin} />
    </Suspense>
  );
}
