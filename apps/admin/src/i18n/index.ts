import type { Dictionary } from './dictionary.ts';
import { en } from './en.ts';
import { ja } from './ja.ts';

export const LOCALES = ['ja', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

const DICTIONARIES: Record<Locale, Dictionary> = { en, ja };

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function dictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'ja' ? 'en' : 'ja';
}

export function preferredLocale(acceptLanguage: string | undefined): Locale {
  let best: Locale | null = null;
  let bestWeight = 0;

  for (const entry of acceptLanguage?.split(',') ?? []) {
    const [tag, ...params] = entry.trim().split(';');
    const language = tag.slice(0, 2).toLowerCase();
    const weightParam = params.find((param) =>
      param.trim().toLowerCase().startsWith('q=')
    );
    const weight = weightParam
      ? Number.parseFloat(weightParam.trim().slice(2))
      : 1;

    if (isLocale(language) && weight > bestWeight) {
      best = language;
      bestWeight = weight;
    }
  }

  return best ?? 'ja';
}
