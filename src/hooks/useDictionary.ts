import { useRouter } from 'next/router';

type Dictionary = { [key: string]: string };

const en = require('../dictionaries/en.json');
const ja = require('../dictionaries/ja.json');

const dictionaries: { [locale: string]: Dictionary } = {
  en,
  ja
};

export default function useDictionary(): Dictionary {
  const router = useRouter();

  return dictionaries[router.locale];
}
