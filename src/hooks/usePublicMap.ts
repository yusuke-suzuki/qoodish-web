import useSWR from 'swr';
import type { AppMap } from '../../types';

export function usePublicMap(mapId: number) {
  const { data, error, mutate } = useSWR<AppMap>(
    mapId
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/guest/maps/${mapId}`]
      : null
  );

  return {
    map: !error && data ? data : null,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
