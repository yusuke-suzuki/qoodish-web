import { useCallback, useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';

type AutocompleteService = {
  current: google.maps.places.AutocompleteService;
};

const autocompleteService: AutocompleteService = {
  current: null
};

export function useAutocompleteService() {
  const fetch = useMemo(
    () =>
      throttle((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 200),
    []
  );

  const fetchPlacePredictions = useCallback(
    (inputValue: string, callback) => {
      fetch({ input: inputValue }, results => {
        callback(results);
      });
    },
    [fetch]
  );

  useEffect(() => {
    if (!autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
    }
  }, []);

  return {
    fetchPlacePredictions: fetchPlacePredictions
  };
}
