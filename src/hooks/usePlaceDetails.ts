import { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'next/router';
import { Fetcher } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useGoogleMapsApi } from './useGoogleMapsApi';

const fetcher: Fetcher<google.maps.places.Place> = async ([
  placeId,
  loader,
  locale = 'en'
]: [
  string,
  Loader,
  google.maps.places.PlaceOptions['requestedLanguage'] | null
]) => {
  const { Place } = await loader.importLibrary('places');

  const place = new Place({
    id: placeId,
    requestedLanguage: locale
  });

  const data = await place.fetchFields({
    fields: ['id', 'location', 'displayName', 'plusCode', 'formattedAddress']
  });

  return data.place;
};

export function usePlaceDetails(placeId: string | null | undefined) {
  const { loader } = useGoogleMapsApi();
  const router = useRouter();

  const { data, error, mutate } = useSWRImmutable<google.maps.places.Place>(
    placeId && loader ? [placeId, loader, router.locale] : null,
    fetcher
  );

  return {
    place: !error && data ? data : null,
    isLoading: !error && !data,
    isError: error,
    mutate: mutate
  };
}
