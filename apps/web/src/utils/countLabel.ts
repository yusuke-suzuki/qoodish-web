import type { Locale } from './locales.ts';

type Dictionary = { [key: string]: string };

export function countLabel(
  locale: Locale,
  dictionary: Dictionary,
  key: string,
  count: number
): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template =
    dictionary[`${key} ${category}`] ?? dictionary[`${key} other`];

  return template ? template.replace('{count}', String(count)) : String(count);
}
