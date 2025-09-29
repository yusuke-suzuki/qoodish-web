import type { User } from 'firebase/auth';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, memo, useCallback } from 'react';
import { SWRConfig } from 'swr';

type Props = {
  children: ReactNode;
};

const fetcher = async ([url, currentUser = null]: [string, User | null]) => {
  const abortController = new AbortController();

  setTimeout(() => {
    abortController.abort();
  }, 10000);

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
    signal: abortController.signal
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
  const handleError = useCallback((error, _key) => {
    console.error(error);
    enqueueSnackbar(error.message, { variant: 'error' });
  }, []);

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
