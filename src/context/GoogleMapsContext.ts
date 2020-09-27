import { createContext } from 'react';

type ContextProps = {
  googleMap: google.maps.Map;
};

const GoogleMapsContext = createContext<ContextProps>({
  googleMap: null
});

export default GoogleMapsContext;
