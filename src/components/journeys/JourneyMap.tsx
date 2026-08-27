'use client';

import { Flag, Place } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';
import type { JourneyPathPoint, Spot } from '../../../types/index.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import { footprintIcons } from '../../utils/journeyTrailIcons.ts';
import GoogleMaps from '../maps/GoogleMaps.tsx';
import MarkerView from '../maps/MarkerView.tsx';

// A flag in the primary color marks a milestone still to reach, the same way
// ReviewMarker badges one on the map screen.
const markerVariants = {
  checkin: { Icon: Place, color: 'secondary.main' },
  milestone: { Icon: Flag, color: 'primary.main' }
} as const;

const JourneySpotMarker = memo(function JourneySpotMarker({
  spot,
  variant
}: {
  spot: Spot;
  variant: keyof typeof markerVariants;
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

  const { Icon, color } = markerVariants[variant];

  return (
    <MarkerView position={position}>
      <Tooltip
        title={spot.name}
        arrow
        enterTouchDelay={0}
        leaveTouchDelay={3000}
      >
        <Icon
          sx={{
            display: 'block',
            fontSize: 34,
            color,
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
  milestones: Spot[];
  path: JourneyPathPoint[];
  fallbackCenter?: JourneyPathPoint;
};

const JourneyMapOverlay = memo(function JourneyMapOverlay({
  spots,
  milestones,
  path,
  fallbackCenter
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

  const fittedPointCountRef = useRef(0);
  const centeredRef = useRef(false);

  useEffect(() => {
    if (!googleMap || !loader) {
      return;
    }

    const points = [
      ...path.map((point) => ({ lat: point.latitude, lng: point.longitude })),
      ...spots.map((spot) => ({ lat: spot.latitude, lng: spot.longitude })),
      ...milestones.map((spot) => ({
        lat: spot.latitude,
        lng: spot.longitude
      }))
    ];

    // A map built without a center renders blank, and a journey that has not
    // been walked yet has no point to fit, so it falls back to its own map.
    if (points.length < 1) {
      if (fallbackCenter && !centeredRef.current) {
        centeredRef.current = true;
        googleMap.setCenter({
          lat: fallbackCenter.latitude,
          lng: fallbackCenter.longitude
        });
      }

      return;
    }

    // The viewport belongs to the user once they pan or zoom, so it is only
    // taken back when a point is added and would otherwise land off screen.
    const grown = points.length > fittedPointCountRef.current;
    fittedPointCountRef.current = points.length;

    if (!grown) {
      return;
    }

    let cancelled = false;

    (async () => {
      const { LatLngBounds } = await loader.importLibrary('core');

      if (cancelled) {
        return;
      }

      const bounds = new LatLngBounds();

      for (const point of points) {
        bounds.extend(point);
      }

      googleMap.fitBounds(bounds, 48);

      if (points.length === 1) {
        googleMap.setZoom(17);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [googleMap, loader, path, spots, milestones, fallbackCenter]);

  return (
    <>
      {milestones.map((spot) => (
        <JourneySpotMarker
          key={`milestone:${spot.latitude},${spot.longitude}`}
          spot={spot}
          variant="milestone"
        />
      ))}

      {spots.map((spot) => (
        <JourneySpotMarker
          key={`${spot.latitude},${spot.longitude}`}
          spot={spot}
          variant="checkin"
        />
      ))}
    </>
  );
});

type Props = {
  spots: Spot[];
  path: JourneyPathPoint[];
  locale: string;
  milestones?: Spot[];
  fallbackCenter?: JourneyPathPoint;
  height?: number | { xs?: number; sm?: number; md?: number };
};

const mapOptions: Partial<google.maps.MapOptions> = {
  streetViewControl: false
};

const noMilestones: Spot[] = [];

function JourneyMap({
  spots,
  path,
  locale,
  milestones = noMilestones,
  fallbackCenter,
  height = 240
}: Props) {
  return (
    <GoogleMaps
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
      sx={{ height, width: '100%' }}
      mapOptions={mapOptions}
      locale={locale}
    >
      <JourneyMapOverlay
        spots={spots}
        milestones={milestones}
        path={path}
        fallbackCenter={fallbackCenter}
      />
    </GoogleMaps>
  );
}

export default memo(JourneyMap);
