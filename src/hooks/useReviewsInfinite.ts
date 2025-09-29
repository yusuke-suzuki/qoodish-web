import { useContext } from 'react';
import useSWRInfinite from 'swr/infinite';
import type { Review } from '../../types';
import AuthContext from '../context/AuthContext';

export function useReviewsInfinite() {
  const { currentUser } = useContext(AuthContext);

  const { data, size, setSize, error, mutate, isLoading } = useSWRInfinite<
    Review[]
  >((pageIndex, previousPageData) => {
    if (!currentUser) {
      return null;
    }

    if (previousPageData && !previousPageData.length) {
      return null;
    }

    if (pageIndex === 0) {
      return [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews`, currentUser];
    }

    return [
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/reviews?next_timestamp=${
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
