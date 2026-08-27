import { memo, useEffect, useRef, useState } from 'react';
import type { JourneyPathPoint } from '../../../types/index.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import { footprintIcons } from '../../utils/journeyTrailIcons.ts';

type Props = {
  position: GeolocationPosition | null;
  path: JourneyPathPoint[] | null;
};

function JourneyOverlay({ position, path }: Props) {
  const { googleMap, loader, setCurrentPosition } = useGoogleMap();

  useEffect(() => {
    if (position) {
      setCurrentPosition(position);
    }
  }, [position, setCurrentPosition]);

  const pannedRef = useRef(false);

  useEffect(() => {
    if (!googleMap || !position || pannedRef.current) {
      return;
    }

    pannedRef.current = true;
    googleMap.panTo({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    googleMap.setZoom(17);
  }, [googleMap, position]);

  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  const active = path !== null;

  useEffect(() => {
    if (!googleMap || !loader || !active) {
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
  }, [googleMap, loader, active]);

  useEffect(() => {
    if (!polyline || !path) {
      return;
    }

    polyline.setPath(
      path.map((point) => ({ lat: point.latitude, lng: point.longitude }))
    );
  }, [polyline, path]);

  return null;
}

export default memo(JourneyOverlay);
