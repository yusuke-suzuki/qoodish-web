import { useCallback, useEffect, useMemo } from 'react';
import throttle from 'lodash/throttle';
import { useGoogleMapsApi } from './useGoogleMapsApi';
import { LoaderStatus } from '@googlemaps/js-api-loader';

type AutocompleteService = {
  current: google.maps.places.AutocompleteService;
};

const autocompleteService: AutocompleteService = {
  current: null
};

export function useAutocompleteService() {
  const { status } = useGoogleMapsApi();

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
    if (status !== LoaderStatus.SUCCESS || autocompleteService.current) {
      return;
    }

    autocompleteService.current = new google.maps.places.AutocompleteService();
  }, [status]);

  return {
    fetchPlacePredictions: fetchPlacePredictions
  };
}
