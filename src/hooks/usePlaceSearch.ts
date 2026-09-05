import { useParams } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { toLocale } from '../utils/locales.ts';
import { useDebouncedSearch } from './useDebouncedSearch.ts';
import { useGoogleMap } from './useGoogleMap.ts';

export const PLACE_FIELDS = [
  'id',
  'location',
  'displayName',
  'plusCode',
  'formattedAddress'
];

export function usePlaceSearch(input: string) {
  const { loader, googleMap, currentPosition } = useGoogleMap();
  const { lang } = useParams<{ lang: string }>();
  const language = toLocale(lang);

  // The token bills everything from the first keystroke to the place lookup
  // as one session. fetchFields ends that session, so the token is discarded
  // and reissued for the next one.
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const search = useCallback(
    async (query: string) => {
      if (!loader) {
        return [];
      }

      const { AutocompleteSessionToken, AutocompleteSuggestion } =
        await loader.importLibrary('places');

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      const { suggestions } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          language,
          sessionToken: sessionTokenRef.current,
          locationBias: googleMap?.getBounds(),
          // origin only yields distanceMeters on each prediction; it does
          // not affect ranking.
          origin: currentPosition
            ? {
                lat: currentPosition.coords.latitude,
                lng: currentPosition.coords.longitude
              }
            : undefined
        });

      return suggestions
        .map((suggestion) => suggestion.placePrediction)
        .filter((prediction) => prediction !== null);
    },
    [loader, language, googleMap, currentPosition]
  );

  const { results: predictions, isLoading } = useDebouncedSearch(input, search);

  const resolvePlace = async (
    prediction: google.maps.places.PlacePrediction
  ) => {
    // The session ends when fetchFields is called rather than when it
    // answers, so the token goes first: input that starts while the response
    // is in flight must not reuse a spent one.
    sessionTokenRef.current = null;

    const { place } = await prediction
      .toPlace()
      .fetchFields({ fields: PLACE_FIELDS });

    return place;
  };

  return {
    predictions,
    isLoading,
    resolvePlace
  };
}
