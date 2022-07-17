import { User } from 'firebase/auth';
import useSWR, { Fetcher } from 'swr';
import { Profile } from '../../types';

type GetProfileResponse = {
  profile: Profile;
};

const fetcher: Fetcher<GetProfileResponse> = async (currentUser: User) => {
  const token = await currentUser.getIdToken();

  const abortController = new AbortController();

  setTimeout(() => {
    abortController.abort();
  }, 10000);

  const opts = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    signal: abortController.signal
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users/${currentUser.uid}`,
    opts
  );

  return await res.json();
};

export function useProfile(currentUser: User) {
  const { data, error, mutate } = useSWR(
    currentUser && !currentUser.isAnonymous ? [currentUser] : null,
    fetcher
  );

  return {
    profile: data,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
