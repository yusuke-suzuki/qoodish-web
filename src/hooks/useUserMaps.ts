import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import { AppMap } from '../../types';
import AuthContext from '../context/AuthContext';

export function useUserMaps(id: number | null) {
  const { currentUser, isLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isLoading || !id) {
      return null;
    }

    if (currentUser) {
      return `/users/${id}/maps`;
    } else {
      return `/guest/users/${id}/maps`;
    }
  }, [currentUser, isLoading, id]);

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
