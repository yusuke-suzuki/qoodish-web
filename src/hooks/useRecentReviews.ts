import useSWR from 'swr';
import { Review } from '../../types';

export function useRecentReviews() {
  const { data, error, mutate } = useSWR<Review[]>([
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/guest/reviews?recent=true`
  ]);

  return {
    reviews: !error && data ? data : [],
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
