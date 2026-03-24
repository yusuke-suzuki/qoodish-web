import { useParams } from 'next/navigation';

type Dictionary = { [key: string]: string };

const en = require('../dictionaries/en.json');
const ja = require('../dictionaries/ja.json');

const dictionaries: { [locale: string]: Dictionary } = {
  en,
  ja
};

export default function useDictionary(): Dictionary {
  const params = useParams<{ lang: string }>();

  return dictionaries[params?.lang] ?? dictionaries.en;
}
