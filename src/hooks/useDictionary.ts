import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Dictionary = { [key: string]: string };

type DictionaryLoader = () => Promise<Dictionary>;

const dictionaries: { [locale: string]: DictionaryLoader } = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  ja: () => import('../dictionaries/ja.json').then((module) => module.default)
};

const getDictionary = async (locale: string): Promise<Dictionary> =>
  dictionaries[locale]();

export default function useDictionary(): NonNullable<Dictionary> {
  const router = useRouter();
  const [dictionary, setDictionary] = useState<NonNullable<Dictionary>>({});

  useEffect(() => {
    getDictionary(router.locale).then(setDictionary);
  }, [router.locale]);

  return dictionary;
}
