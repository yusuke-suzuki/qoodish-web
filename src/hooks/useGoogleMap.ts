import { useContext } from 'react';
import GoogleMapsContext from '../context/GoogleMapsContext.ts';

export function useGoogleMap() {
  return useContext(GoogleMapsContext);
}
