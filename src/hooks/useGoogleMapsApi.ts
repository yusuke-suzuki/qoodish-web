import { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export function useGoogleMapsApi() {
  const router = useRouter();

  const loader = useMemo(() => {
    return new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'beta',
      language: router.locale
    });
  }, [router.locale]);

  return {
    loader
  };
}
