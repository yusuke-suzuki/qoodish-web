'use client';
import { useParams } from 'next/navigation';
import { localePath } from '../utils/locales';

/**
 * Builds an in-app href carrying the active locale prefix. Locale-less hrefs
 * would send every visitor through the middleware redirect and, for crawlers,
 * make the localized variants unreachable by internal links.
 */
export default function useLocalePath() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang;

  return (path = '') => localePath(lang, path);
}
