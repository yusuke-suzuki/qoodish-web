'use client';

import { Place } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';
import type { JourneyPathPoint, Spot } from '../../../types';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import { footprintIcons } from '../../utils/journeyTrailIcons';
import GoogleMaps from '../maps/GoogleMaps';
import MarkerView from '../maps/MarkerView';

const JourneySpotMarker = memo(function JourneySpotMarker({
  spot
}: {
  spot: Spot;
}) {
  const { loader } = useGoogleMap();
  const [position, setPosition] = useState<google.maps.LatLng | null>(null);

  useEffect(() => {
    let disposed = false;

    (async () => {
      const { LatLng } = await loader.importLibrary('core');

      if (!disposed) {
        setPosition(new LatLng(spot.latitude, spot.longitude));
      }
    })();

    return () => {
      disposed = true;
    };
  }, [loader, spot]);

  if (!position) {
    return null;
  }

  return (
    <MarkerView position={position}>
      <Tooltip
        title={spot.name}
        arrow
        enterTouchDelay={0}
        leaveTouchDelay={3000}
      >
        <Place
          sx={{
            display: 'block',
            fontSize: 34,
            color: 'secondary.main',
            filter:
              'drop-shadow(0 0 1px #fff) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35))'
          }}
        />
      </Tooltip>
    </MarkerView>
  );
});

type OverlayProps = {
  spots: Spot[];
  path: JourneyPathPoint[];
};

const JourneyMapOverlay = memo(function JourneyMapOverlay({
  spots,
  path
}: OverlayProps) {
  const { googleMap, loader } = useGoogleMap();

  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!googleMap || !loader) {
      return;
    }

    let disposed = false;
    let line: google.maps.Polyline | null = null;

    (async () => {
      const { Polyline } = await loader.importLibrary('maps');
      const { Point } = await loader.importLibrary('core');

      if (disposed) {
        return;
      }

      line = new Polyline({
        map: googleMap,
        path: [],
        strokeOpacity: 0,
        icons: footprintIcons(Point)
      });

      setPolyline(line);
    })();

    return () => {
      disposed = true;
      line?.setMap(null);
      setPolyline(null);
    };
  }, [googleMap, loader]);

  useEffect(() => {
    if (!polyline) {
      return;
    }

    polyline.setPath(
      path.map((point) => ({ lat: point.latitude, lng: point.longitude }))
    );
  }, [polyline, path]);

  const fittedRef = useRef(false);

  useEffect(() => {
    if (!googleMap || !loader || fittedRef.current) {
      return;
    }

    const points = [
      ...path.map((point) => ({ lat: point.latitude, lng: point.longitude })),
      ...spots.map((spot) => ({ lat: spot.latitude, lng: spot.longitude }))
    ];

    if (points.length < 1) {
      return;
    }

    fittedRef.current = true;

    (async () => {
      const { LatLngBounds } = await loader.importLibrary('core');
      const bounds = new LatLngBounds();

      for (const point of points) {
        bounds.extend(point);
      }

      googleMap.fitBounds(bounds, 48);

      if (points.length === 1) {
        googleMap.setZoom(17);
      }
    })();
  }, [googleMap, loader, path, spots]);

  return (
    <>
      {spots.map((spot) => (
        <JourneySpotMarker
          key={`${spot.latitude},${spot.longitude}`}
          spot={spot}
        />
      ))}
    </>
  );
});

type Props = {
  spots: Spot[];
  path: JourneyPathPoint[];
  locale: string;
  height?: number | { xs?: number; sm?: number; md?: number };
};

const mapOptions: Partial<google.maps.MapOptions> = {
  streetViewControl: false
};

function JourneyMap({ spots, path, locale, height = 240 }: Props) {
  return (
    <GoogleMaps
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
      sx={{ height, width: '100%' }}
      mapOptions={mapOptions}
      locale={locale}
    >
      <JourneyMapOverlay spots={spots} path={path} />
    </GoogleMaps>
  );
}

export default memo(JourneyMap);
