import { Loader } from '@googlemaps/js-api-loader';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useGoogleMapsApi() {
  const [googleMapsApiLoaded, setGoogleMapsApiLoaded] = useState<boolean>(
    false
  );

  const loader = useMemo(() => {
    return new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      region: 'JP',
      language: 'ja'
    });
  }, []);

  const initGoogleMapsApi = useCallback(async () => {
    await loader.load();

    setGoogleMapsApiLoaded(true);
  }, []);

  useEffect(() => {
    if (googleMapsApiLoaded) {
      return;
    }

    initGoogleMapsApi();
  }, []);

  return {
    status: loader.status
  };
}
