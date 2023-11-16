import { useContext, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { Review } from '../../types';
import AuthContext from '../context/AuthContext';

export function useUserReviewsInfinite(id: number) {
  const { currentUser, isLoading: isAuthLoading } = useContext(AuthContext);

  const path = useMemo(() => {
    if (isAuthLoading || !id) {
      return null;
    }

    if (currentUser) {
      return `/users/${id}/reviews`;
    } else {
      return `/guest/users/${id}/reviews`;
    }
  }, [currentUser, isAuthLoading, id]);

  const { data, size, setSize, error, mutate, isLoading } = useSWRInfinite<
    Review[]
  >((pageIndex, previousPageData) => {
    if (!id || !path) {
      return null;
    }

    if (previousPageData && !previousPageData.length) {
      return null;
    }

    if (pageIndex === 0) {
      return [`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, currentUser];
    }

    return [
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}?next_timestamp=${
        previousPageData[previousPageData.length - 1].created_at
      }`,
      currentUser
    ];
  });

  return {
    data: !error && data ? data : [],
    isError: error,
    mutate: mutate,
    size: size,
    setSize: setSize,
    noMoreResults: !data || (data.length && data[data.length - 1].length < 1),
    isLoadingMore:
      isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined'),
    isEmpty: !data || (data.length && data[0].length < 1)
  };
}
