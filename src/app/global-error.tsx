'use client';

import { useEffect, useSyncExternalStore } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const subscribe = () => () => {};

const getBrowserLang = () =>
  navigator.language.startsWith('ja') ? 'ja' : 'en';

const getServerLang = () => 'en';

const messages = {
  en: {
    title: 'Something went wrong',
    description:
      'Sorry, an unexpected error occurred. Please try again in a moment.',
    retry: 'Try again'
  },
  ja: {
    title: 'エラーが発生しました',
    description: 'しばらくしてからもう一度お試しください。',
    retry: 'もう一度試す'
  }
} as const;

// Replaces the root layout when it crashes, so everything here has to be
// self-contained: no theme provider, no dictionary hook, inline styles only.
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const lang = useSyncExternalStore(subscribe, getBrowserLang, getServerLang);
  const m = messages[lang];

  return (
    <html lang={lang}>
      <head>
        <meta name="theme-color" content="#ffc107" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#fafafa',
          color: '#333'
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {m.title}
          </h1>
          <p
            style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem' }}
          >
            {m.description}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffc107',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 500,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {m.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
