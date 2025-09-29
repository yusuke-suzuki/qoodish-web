import { useContext } from 'react';
import useSWR from 'swr';
import type { Notification } from '../../types';
import AuthContext from '../context/AuthContext';

export function useNotifications() {
  const { currentUser } = useContext(AuthContext);

  const { data, error, mutate } = useSWR<Notification[]>(
    currentUser
      ? [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/notifications`, currentUser]
      : null
  );

  return {
    notifications: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
