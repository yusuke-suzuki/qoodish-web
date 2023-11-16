import { createContext } from 'react';

type ContextProps = {
  googleMap: google.maps.Map | null;
  currentPosition: GeolocationPosition | null;
  setCurrentPosition: (position: GeolocationPosition) => void;
};

const GoogleMapsContext = createContext<ContextProps>({
  googleMap: null,
  currentPosition: null,
  setCurrentPosition: () => {}
});

export default GoogleMapsContext;
