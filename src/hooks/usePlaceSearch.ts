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

  // 入力開始から Place の取得までを 1 セッションとして課金させるためのトークン。
  // fetchFields でセッションが終了するので、そのたびに破棄して次のセッション用に再発行する。
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
    // セッションは fetchFields の応答ではなく呼び出しで終了するため、
    // 待っている間に始まった入力が終了済みのトークンを使い回さないよう先に破棄する
    sessionTokenRef.current = null;

    const { place } = await prediction
      .toPlace()
      .fetchFields({ fields: PLACE_FIELDS });

    return place;
  };

  useEffect(() => {
    // 実行中のリクエストは debounce の待ち時間中にも解決しうるため、
    // ID の採番は待ち時間の前、入力が変わった時点で行う
    const requestId = ++requestIdRef.current;

    if (!input) {
      fetchSuggestions.cancel();

      setPredictions([]);
      setIsLoading(false);

      return;
    }

    // デバウンスの待ち時間もリクエスト中と同じ扱いにする。
    // 本体の先頭で立てると、その間だけ候補ゼロかつ非ローディングになり
    // Autocomplete が「見つかりません」を表示してしまう。
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
