type Dictionary = { [key: string]: string };

// A locale declares only the plural categories its language has, so Japanese
// carries `other` alone and English adds `one`.
export function countLabel(
  lang: string,
  dictionary: Dictionary,
  key: string,
  count: number
): string {
  const category = new Intl.PluralRules(lang).select(count);
  const template =
    dictionary[`${key} ${category}`] ?? dictionary[`${key} other`];

  return template.replace('{count}', String(count));
}
