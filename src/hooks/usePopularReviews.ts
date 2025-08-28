import useSWR from 'swr';
import type { Review } from '../../types';

export function usePopularReviews() {
  const { data, error, mutate } = useSWR<Review[]>([
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/guest/reviews?popular=true`
  ]);

  return {
    reviews: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
