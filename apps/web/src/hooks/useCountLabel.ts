'use client';
import { useParams } from 'next/navigation';
import { countLabel } from '../utils/countLabel.ts';
import { toLocale } from '../utils/locales.ts';
import useDictionary from './useDictionary.ts';

export default function useCountLabel(): (
  key: string,
  count: number
) => string {
  const params = useParams<{ lang: string }>();
  const dictionary = useDictionary();

  return (key, count) =>
    countLabel(toLocale(params?.lang), dictionary, key, count);
}
