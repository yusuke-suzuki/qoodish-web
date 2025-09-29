import useSWR from 'swr';
import type { AppMap } from '../../types';

export function usePopularMaps() {
  const { data, error, mutate } = useSWR<AppMap[]>([
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/guest/maps?popular=true`
  ]);

  return {
    maps: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
