import { Loader } from '@googlemaps/js-api-loader';
import { Box, type SxProps, useMediaQuery, useTheme } from '@mui/material';
import {
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import GoogleMapsContext from '../../context/GoogleMapsContext';

type Props = {
  mapId: string;
  children?: ReactNode;
  sx: SxProps;
  mapOptions?: Partial<google.maps.MapOptions>;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  locale?: string;
};

function GoogleMaps({
  mapId,
  children,
  sx,
  mapOptions,
  center,
  zoom,
  locale
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] =
    useState<GeolocationPosition | null>(null);

  const loader = useMemo(() => {
    return new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'beta'
    });
  }, []);

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const initGoogleMaps = useCallback(async () => {
    if (!mapRef.current) {
      return;
    }

    const { Map: GoogleMap } = await loader.importLibrary('maps');
    const { ControlPosition } = await loader.importLibrary('core');

    const map = new GoogleMap(mapRef.current as HTMLElement, {
      zoom: 17,
      zoomControl: !!mdUp,
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
    if (!locale) {
      return;
    }

    loader.options.language = locale;
  }, [loader, locale]);

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
          loader: loader,
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
