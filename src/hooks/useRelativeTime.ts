'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { relativeTime } from '../utils/relativeTime.ts';
import { LOCAL_DATE_TIME_PLACEHOLDER } from './useLocalDateTime.ts';

export default function useRelativeTime() {
  const { lang } = useParams<{ lang: string }>();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (value: string) =>
    mounted
      ? relativeTime(lang, new Date(value), new Date())
      : LOCAL_DATE_TIME_PLACEHOLDER;
}
