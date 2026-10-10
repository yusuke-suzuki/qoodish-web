import { en, type MessageKey, type Messages } from './en.ts';
import { ja } from './ja.ts';

export const LOCALES = ['en', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

const MESSAGES: Record<Locale, Messages> = { en, ja };

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function localeFromAcceptLanguage(
  acceptLanguage: string | undefined
): Locale {
  const language = acceptLanguage?.match(/^[a-z]{2}/)?.[0];

  return isLocale(language) ? language : DEFAULT_LOCALE;
}

export function translate(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key];
}

export type { MessageKey, Messages };
