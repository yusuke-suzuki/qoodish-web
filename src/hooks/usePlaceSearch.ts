import debounce from 'lodash.debounce';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGoogleMap } from './useGoogleMap';

const PLACE_FIELDS = [
  'id',
  'location',
  'displayName',
  'plusCode',
  'formattedAddress'
];

export function usePlaceSearch(input: string) {
  const { loader } = useGoogleMap();
  const { lang } = useParams<{ lang: string }>();

  const [predictions, setPredictions] = useState<
    google.maps.places.PlacePrediction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // 入力開始から Place の取得までを 1 セッションとして課金させるためのトークン。
  // fetchFields でセッションが終了するので、そのたびに破棄して次のセッション用に再発行する。
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestIdRef = useRef(0);

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!loader) {
          return;
        }

        const requestId = ++requestIdRef.current;

        setIsLoading(true);

        try {
          const { AutocompleteSessionToken, AutocompleteSuggestion } =
            await loader.importLibrary('places');

          if (!sessionTokenRef.current) {
            sessionTokenRef.current = new AutocompleteSessionToken();
          }

          const { suggestions } =
            await AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input: query,
              language: lang,
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
    [loader, lang]
  );

  const resolvePlace = async (
    prediction: google.maps.places.PlacePrediction
  ) => {
    const { place } = await prediction
      .toPlace()
      .fetchFields({ fields: PLACE_FIELDS });

    sessionTokenRef.current = null;

    return place;
  };

  useEffect(() => {
    if (!input) {
      fetchSuggestions.cancel();

      requestIdRef.current += 1;

      setPredictions([]);
      setIsLoading(false);

      return;
    }

    fetchSuggestions(input);

    return () => fetchSuggestions.cancel();
  }, [input, fetchSuggestions]);

  return {
    predictions,
    isLoading,
    resolvePlace
  };
}
