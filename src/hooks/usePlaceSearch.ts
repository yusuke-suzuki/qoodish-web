import debounce from 'lodash.debounce';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toLocale } from '../utils/locales.ts';
import { useGoogleMap } from './useGoogleMap.ts';

export const PLACE_FIELDS = [
  'id',
  'location',
  'displayName',
  'plusCode',
  'formattedAddress'
];

export function usePlaceSearch(input: string) {
  const { loader } = useGoogleMap();
  const { lang } = useParams<{ lang: string }>();
  const language = toLocale(lang);

  const [predictions, setPredictions] = useState<
    google.maps.places.PlacePrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // The token bills everything from the first keystroke to the place lookup
  // as one session. fetchFields ends that session, so the token is discarded
  // and reissued for the next one.
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestIdRef = useRef(0);

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query: string, requestId: number) => {
        try {
          if (!loader) {
            return;
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
              sessionToken: sessionTokenRef.current
            });

          if (requestId !== requestIdRef.current) {
            return;
          }

          setPredictions(
            suggestions
              .map((suggestion) => suggestion.placePrediction)
              .filter((prediction) => prediction !== null)
          );
        } catch {
          if (requestId === requestIdRef.current) {
            setPredictions([]);
          }
        } finally {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        }
      }, 300),
    [loader, language]
  );

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

  useEffect(() => {
    // A request already in flight can resolve during the debounce wait, so
    // the id is taken when the input changes rather than after the wait.
    const requestId = ++requestIdRef.current;

    if (!input) {
      fetchSuggestions.cancel();

      setPredictions([]);
      setIsLoading(false);

      return;
    }

    // The debounce wait counts as part of the request. Raising this inside
    // the debounced body instead leaves a window with no suggestions and no
    // loading flag, which is what the Autocomplete renders "not found" for.
    setIsLoading(true);

    fetchSuggestions(input, requestId);

    return () => fetchSuggestions.cancel();
  }, [input, fetchSuggestions]);

  return {
    predictions,
    isLoading,
    resolvePlace
  };
}
