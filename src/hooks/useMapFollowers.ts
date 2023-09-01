import { User } from 'firebase/auth';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import { Follower } from '../../types';
import AuthContext from '../context/AuthContext';

export function useMapFollowers(mapId: number | null) {
  const { currentUser, isLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isLoading || !mapId) {
      return null;
    }

    if (currentUser) {
      return `/maps/${mapId}/collaborators`;
    } else {
      return `/guest/maps/${mapId}/collaborators`;
    }
  }, [currentUser, isLoading, mapId]);

  const { data, error, mutate } = useSWR<Follower[]>(
    path
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, currentUser]
      : null
  );

  return {
    followers: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
