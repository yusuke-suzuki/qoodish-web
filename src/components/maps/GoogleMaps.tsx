import { Loader } from '@googlemaps/js-api-loader';
import { Box, type SxProps, useMediaQuery, useTheme } from '@mui/material';
import { useParams } from 'next/navigation';
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import GoogleMapsContext from '../../context/GoogleMapsContext.ts';
import { toLocale } from '../../utils/locales.ts';

// The Maps script carries its language in the URL it is loaded from, so the
// first map on a document settles the language for every later one, and the
// Loader enforces that by throwing when constructed again with different
// options. Handing back the existing instance keeps a locale reached by
// client navigation from throwing on a change the loaded script could not
// have honoured anyway; a full load picks the new language up.
let loader: Loader | null = null;

function getLoader(language: string): Loader {
  if (!loader) {
    loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'beta',
      language
    });
  }

  return loader;
}

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
  const { lang } = useParams<{ lang: string }>();

  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] =
    useState<GeolocationPosition | null>(null);

  const loader = getLoader(toLocale(lang));

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
    if (!googleMap && mapRef.current && loader) {
      initGoogleMaps();
    }
  }, [googleMap, loader, initGoogleMaps]);

  useEffect(() => {
    if (!('geolocation' in navigator) || !('permissions' in navigator)) {
      return;
    }

    let cancelled = false;

    const restoreCurrentPosition = async () => {
      let status: PermissionStatus;

      try {
        status = await navigator.permissions.query({ name: 'geolocation' });
      } catch {
        // Safari below 16 rejects the geolocation query; without a readable
        // permission state, getCurrentPosition could raise the browser prompt.
        return;
      }

      if (cancelled || status.state !== 'granted') {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!cancelled) {
            setCurrentPosition(position);
          }
        },
        () => {},
        {
          enableHighAccuracy: false,
          maximumAge: 30000,
          timeout: 10000
        }
      );
    };

    restoreCurrentPosition();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const contextValue = useMemo(
    () => ({
      googleMap,
      loader,
      currentPosition,
      setCurrentPosition
    }),
    [googleMap, loader, currentPosition]
  );

  return (
    <Box>
      <Box ref={mapRef} sx={sx} />

      <GoogleMapsContext.Provider value={contextValue}>
        {children}
      </GoogleMapsContext.Provider>
    </Box>
  );
}

export default memo(GoogleMaps);
