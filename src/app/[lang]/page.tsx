import { Metadata } from 'next';
import { Locale, getDictionary } from '../../i18n';

export const metadata: Metadata = {
  title: {
    absolute: 'Qoodish'
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'ja-JP': '/ja'
    }
  }
};

export default async function Page({
  params: { lang }
}: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
  return <div>{dict.timeline}</div>;
}
