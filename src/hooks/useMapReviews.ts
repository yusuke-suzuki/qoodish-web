import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import type { Review } from '../../types';
import AuthContext from '../context/AuthContext';

export function useMapReviews(mapId: number | null) {
  const { currentUser, isLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isLoading || !mapId) {
      return null;
    }

    if (currentUser) {
      return `/maps/${mapId}/reviews`;
    }
    return `/guest/maps/${mapId}/reviews`;
  }, [currentUser, isLoading, mapId]);

  const { data, error, mutate } = useSWR<Review[]>(
    path && mapId
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, currentUser]
      : null
  );

  return {
    reviews: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
