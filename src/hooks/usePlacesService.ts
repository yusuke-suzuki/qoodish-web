import { useCallback, useEffect } from 'react';

type PlacesService = {
  current: google.maps.places.PlacesService;
};

const placesService: PlacesService = {
  current: null
};

export function usePlacesService(googleMap: google.maps.Map) {
  const fetchPlaceDetails = useCallback(
    (placeId: string): Promise<google.maps.places.PlaceResult> => {
      return new Promise((resolve, reject) => {
        if (!placesService.current) {
          reject('Places service is not initialized');
        }

        if (!placeId) {
          reject('Place ID is required');
        }

        const params = {
          placeId: placeId,
          fields: ['name', 'place_id', 'geometry']
        };

        placesService.current.getDetails(params, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(place);
          } else {
            reject();
          }
        });
      });
    },
    [placesService]
  );

  useEffect(() => {
    if (googleMap && !placesService.current) {
      placesService.current = new google.maps.places.PlacesService(googleMap);
    }
  }, [googleMap]);

  return { fetchPlaceDetails };
}
