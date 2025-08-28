import useSWR from 'swr';
import type { AppMap } from '../../types';

export function useMapPredictions(input: string | null | undefined) {
  const { data, error, mutate } = useSWR<AppMap[]>(
    input
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/guest/maps?input=${input}`]
      : null
  );

  return {
    options: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
