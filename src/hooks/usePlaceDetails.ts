import type { Loader } from '@googlemaps/js-api-loader';
import { useRouter } from 'next/router';
import type { Fetcher } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useGoogleMap } from './useGoogleMap';

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
  const { loader } = useGoogleMap();
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
