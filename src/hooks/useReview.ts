import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import type { Review } from '../../types';
import AuthContext from '../context/AuthContext';

export function useReview(mapId: number | null, reviewId: number | null) {
  const { currentUser, isLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isLoading || !mapId || !reviewId) {
      return null;
    }

    if (currentUser) {
      return `/maps/${mapId}/reviews/${reviewId}`;
    }
    return `/guest/reviews/${reviewId}`;
  }, [currentUser, isLoading, mapId, reviewId]);

  const { data, error, mutate } = useSWR<Review>(
    path
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, currentUser]
      : null
  );

  return {
    review: !error && data ? data : null,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
