import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import type { Profile } from '../../types';
import AuthContext from '../context/AuthContext';

export function useProfile(id: number | string) {
  const { currentUser, isLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isLoading || !id) {
      return null;
    }

    if (currentUser) {
      return `/users/${id}`;
    }
    return `/guest/users/${id}`;
  }, [currentUser, isLoading, id]);

  const { data, error, mutate } = useSWR<Profile>(
    path
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, currentUser]
      : null
  );

  return {
    profile: !error && data ? data : null,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
