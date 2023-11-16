import { useContext } from 'react';
import useSWR from 'swr';
import { PublicUser } from '../../types';
import AuthContext from '../context/AuthContext';

export function useUserPredictions(input: string | null | undefined) {
  const { currentUser } = useContext(AuthContext);

  const { data, error, mutate } = useSWR<PublicUser[]>(
    currentUser && input
      ? [
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users?input=${input}`,
          currentUser
        ]
      : null
  );

  return {
    options: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
