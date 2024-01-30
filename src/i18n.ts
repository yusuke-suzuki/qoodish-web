export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ja']
} as const;

export type Locale = (typeof i18n)['locales'][number];

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ja: () => import('./dictionaries/ja.json').then((module) => module.default)
};

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();
