import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import type { AppMap } from '../../types';
import AuthContext from '../context/AuthContext';

export function useRecommendMaps() {
  const { currentUser, isLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (currentUser) {
      return '/maps?recommend=true';
    }
    return '/guest/maps?recommend=true';
  }, [currentUser, isLoading]);

  const { data, error, mutate } = useSWR<AppMap[]>(
    path
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, currentUser]
      : null
  );

  return {
    maps: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
