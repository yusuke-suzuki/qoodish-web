import { memo, useCallback, useEffect, useState } from 'react';
import { useGoogleMap } from '../../hooks/useGoogleMap';

type Props = {
  defaultPosition?: google.maps.LatLng | google.maps.LatLngLiteral | null;
  onLatLngChanged: (center: google.maps.LatLngLiteral) => void;
};

export default memo(function DraggableMarker({
  defaultPosition,
  onLatLngChanged
}: Props) {
  const { googleMap, loader } = useGoogleMap();

  const [markerView, setMarkerView] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const handleDragEnd = useCallback(
    ({ latLng }: google.maps.MapMouseEvent) => {
      if (!latLng) {
        return;
      }

      onLatLngChanged({
        lat: latLng.lat(),
        lng: latLng.lng()
      });
    },
    [onLatLngChanged]
  );

  const initMarker = useCallback(async () => {
    const { AdvancedMarkerElement } = await loader.importLibrary('marker');

    setMarkerView(
      new AdvancedMarkerElement({
        map: googleMap,
        gmpDraggable: true,
        zIndex: 2
      })
    );
  }, [googleMap, loader]);

  useEffect(() => {
    if (!markerView) {
      return;
    }

    markerView.addListener('dragend', handleDragEnd);
  }, [markerView, handleDragEnd]);

  useEffect(() => {
    if (!markerView && googleMap && loader) {
      initMarker();
    }

    return () => {
      if (markerView) {
        markerView.map = null;
      }
    };
  }, [markerView, googleMap, loader, initMarker]);

  useEffect(() => {
    if (markerView && defaultPosition) {
      markerView.position = defaultPosition;
    }
  }, [markerView, defaultPosition]);

  return null;
});
