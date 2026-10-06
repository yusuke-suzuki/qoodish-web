'use client';

import { useParams } from 'next/navigation';
import { relativeTime } from '../utils/relativeTime.ts';
import useHydrated from './useHydrated.ts';
import { LOCAL_DATE_TIME_PLACEHOLDER } from './useLocalDateTime.ts';

export default function useRelativeTime() {
  const { lang } = useParams<{ lang: string }>();

  const mounted = useHydrated();

  return (value: string) =>
    mounted
      ? relativeTime(lang, new Date(value), new Date())
      : LOCAL_DATE_TIME_PLACEHOLDER;
}
