import type { User } from 'firebase/auth';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, memo, useCallback } from 'react';
import { SWRConfig } from 'swr';
import useDictionary from '../hooks/useDictionary';

type Props = {
  children: ReactNode;
};

const fetcher = async ([url, currentUser = null]: [string, User | null]) => {
  const headers = new Headers({
    Accept: 'application/json',
    'Accept-Language': window.navigator.language,
    'Content-Type': 'application/json'
  });

  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.append('Authorization', `Bearer ${token}`);
  }

  const request = new Request(url, {
    method: 'GET',
    headers: headers,
    signal: AbortSignal.timeout(10000)
  });

  const res = await fetch(request);

  if (!res.ok) {
    const err = await res.json();
    const error = new Error(err.detail);
    error.name = err.title;
    throw error;
  }

  return res.json();
};

export default memo(function SWRContainer({ children }: Props) {
  const dictionary = useDictionary();

  const handleError = useCallback(
    (error: Error, _key: string) => {
      console.error(error);

      if (error.name === 'TimeoutError') {
        enqueueSnackbar(dictionary['request timed out'], {
          variant: 'warning'
        });
        return;
      }

      enqueueSnackbar(error.message, { variant: 'error' });
    },
    [dictionary]
  );

  return (
    <SWRConfig
      value={{
        fetcher: fetcher,
        onError: handleError
      }}
    >
      {children}
    </SWRConfig>
  );
});
