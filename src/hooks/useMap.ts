import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import type { AppMap } from '../../types';
import AuthContext from '../context/AuthContext';

export function useMap(mapId: number) {
  const { currentUser, isLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isLoading || !mapId) {
      return null;
    }

    if (currentUser) {
      return `/maps/${mapId}`;
    }
    return `/guest/maps/${mapId}`;
  }, [currentUser, isLoading, mapId]);

  const { data, error, mutate } = useSWR<AppMap>(
    path
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, currentUser]
      : null
  );

  return {
    map: !error && data ? data : null,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
