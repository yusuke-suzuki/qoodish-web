type Dictionary = { [key: string]: string };

const dictionaries: { [locale: string]: Dictionary } = {
  en: require('../dictionaries/en.json'),
  ja: require('../dictionaries/ja.json')
};

export function getDictionary(lang: string): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}
