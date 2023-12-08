import { Loader } from '@googlemaps/js-api-loader';
import { createContext } from 'react';

type ContextProps = {
  googleMap: google.maps.Map | null;
  loader: Loader | null;
  currentPosition: GeolocationPosition | null;
  setCurrentPosition: (position: GeolocationPosition) => void;
};

const GoogleMapsContext = createContext<ContextProps>({
  googleMap: null,
  loader: null,
  currentPosition: null,
  setCurrentPosition: () => {}
});

export default GoogleMapsContext;
