'use client';

import { usePathname } from 'next/navigation';
import {
  LOCALES,
  type Locale,
  localePath,
  splitLocalePath
} from '../utils/locales.ts';
import useDictionary from './useDictionary.ts';

export type LocaleLink = {
  locale: Locale;
  label: string;
  href: string;
  current: boolean;
};

/**
 * Every locale this page exists under, the reader's own included, so the
 * choice can be shown rather than merely offered. The query string is left
 * behind: reading it would force a Suspense boundary around whichever layout
 * renders the switch, and a locale change is a fresh look at the page rather
 * than a continuation of a selection made within it.
 */
export default function useLocaleLinks(): LocaleLink[] {
  const pathname = usePathname();
  const dictionary = useDictionary();

  const { locale: current, path } = splitLocalePath(pathname);

  return LOCALES.map((locale) => ({
    locale,
    // Both dictionaries answer with the language's own name, so a reader
    // finds their language written in a way they can read whichever one
    // they are stuck in. Translating either would defeat the switch.
    label: dictionary[`${locale} language`],
    href: localePath(locale, path),
    current: locale === current
  }));
}
