import { useContext } from 'react';
import GoogleMapsContext from '../context/GoogleMapsContext';

export function useGoogleMap() {
  return useContext(GoogleMapsContext);
}
