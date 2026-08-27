import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toLocale } from '../utils/locales.ts';
import { useGoogleMap } from './useGoogleMap.ts';
import { PLACE_FIELDS } from './usePlaceSearch.ts';

const placeCache = new Map<string, google.maps.places.Place>();

export function usePlaceDetails(placeId: string | null | undefined) {
  const { loader } = useGoogleMap();
  const { lang } = useParams<{ lang: string }>();
  const language = toLocale(lang);

  const [place, setPlace] = useState<google.maps.places.Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!placeId || !loader) {
      return;
    }

    const cacheKey = `${placeId}-${language}`;
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
          requestedLanguage: language
        });

        const data = await placeInstance.fetchFields({
          fields: PLACE_FIELDS
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
  }, [placeId, loader, language]);

  return {
    place,
    isLoading,
    isError
  };
}
