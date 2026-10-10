import { en, type MessageKey, type Messages } from './en.ts';
import { ja } from './ja.ts';

export const LOCALES = ['en', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

const MESSAGES: Record<Locale, Messages> = { en, ja };

export function translate(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key];
}

export type { MessageKey, Messages };
