import type { Loader } from '@googlemaps/js-api-loader';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGoogleMap } from './useGoogleMap';

const placeCache = new Map<string, google.maps.places.Place>();

export function usePlaceDetails(placeId: string | null | undefined) {
  const { loader } = useGoogleMap();
  const { lang } = useParams<{ lang: string }>();

  const [place, setPlace] = useState<google.maps.places.Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!placeId || !loader) {
      return;
    }

    const cacheKey = `${placeId}-${lang}`;
    const cached = placeCache.get(cacheKey);

    if (cached) {
      setPlace(cached);
      return;
    }

    let cancelled = false;

    const fetchPlace = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const { Place } = await loader.importLibrary('places');

        const placeInstance = new Place({
          id: placeId,
          requestedLanguage: lang ?? 'en'
        });

        const data = await placeInstance.fetchFields({
          fields: [
            'id',
            'location',
            'displayName',
            'plusCode',
            'formattedAddress'
          ]
        });

        if (!cancelled) {
          placeCache.set(cacheKey, data.place);
          setPlace(data.place);
        }
      } catch {
        if (!cancelled) {
          setIsError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPlace();

    return () => {
      cancelled = true;
    };
  }, [placeId, loader, lang]);

  return {
    place,
    isLoading,
    isError
  };
}
