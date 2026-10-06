import en from '../dictionaries/en.json' with { type: 'json' };
import ja from '../dictionaries/ja.json' with { type: 'json' };

export type Dictionary = { [key: string]: string };

const dictionaries: { [locale: string]: Dictionary } = { en, ja };

export function getDictionary(lang: string): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}
