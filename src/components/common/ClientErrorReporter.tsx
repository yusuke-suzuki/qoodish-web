'use client';

import { useEffect } from 'react';
import reportClientError from '../../utils/reportClientError.ts';

export default function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientError(event.error ?? event.message, 'window');
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      reportClientError(event.reason, 'unhandledrejection');
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
