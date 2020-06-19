import React from 'react';

interface ContextProps {
  gMap: any;
  googleMapsApi: any;
}

const GoogleMapsContext = React.createContext({} as ContextProps);

export default GoogleMapsContext;
