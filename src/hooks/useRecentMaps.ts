import useSWR from 'swr';
import { AppMap } from '../../types';

export function useRecentMaps() {
  const { data, error, mutate } = useSWR<AppMap[]>([
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/guest/maps?recent=true`
  ]);

  return {
    maps: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
