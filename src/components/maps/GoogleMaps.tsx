import { Box, SxProps, useMediaQuery, useTheme } from '@mui/material';
import {
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import GoogleMapsContext from '../../context/GoogleMapsContext';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';

type Props = {
  mapId: string;
  children?: ReactNode;
  sx: SxProps;
  mapOptions?: Partial<google.maps.MapOptions>;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
};

function GoogleMaps({ mapId, children, sx, mapOptions, center, zoom }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] =
    useState<GeolocationPosition | null>(null);

  const { loader } = useGoogleMapsApi();

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const initGoogleMaps = useCallback(async () => {
    if (!mapRef.current) {
      return;
    }

    const { Map } = await loader.importLibrary('maps');
    const { ControlPosition } = await loader.importLibrary('core');

    const map = new Map(mapRef.current, {
      zoom: 17,
      zoomControl: mdUp ? true : false,
      zoomControlOptions: {
        position: ControlPosition.LEFT_BOTTOM
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: ControlPosition.LEFT_BOTTOM
      },
      scaleControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy',
      mapId: mapId,
      ...mapOptions
    });

    setGoogleMap(map);
  }, [mapId, mapOptions, mdUp, loader]);

  useEffect(() => {
    if (!googleMap && mapRef.current && loader) {
      initGoogleMaps();
    }
  }, [googleMap, loader, initGoogleMaps]);

  useEffect(() => {
    if (googleMap && center) {
      googleMap.panTo(center);
    }
  }, [googleMap, center]);

  useEffect(() => {
    if (googleMap && zoom) {
      googleMap.setZoom(zoom);
    }
  }, [googleMap, zoom]);

  return (
    <Box>
      <Box ref={mapRef} sx={sx} />

      <GoogleMapsContext.Provider
        value={{
          googleMap: googleMap,
          currentPosition: currentPosition,
          setCurrentPosition: setCurrentPosition
        }}
      >
        {children}
      </GoogleMapsContext.Provider>
    </Box>
  );
}

export default memo(GoogleMaps);
