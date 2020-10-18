import {
  useEffect,
  useCallback,
  useContext,
  ReactNode,
  useMemo,
  memo
} from 'react';
import { createPortal } from 'react-dom';
import GoogleMapsContext from '../../context/GoogleMapsContext';

type Props = {
  position: google.maps.LatLng;
  enableRealtimeUpdate?: boolean;
  children: ReactNode;
};

export default memo(function OverlayView(props: Props) {
  const { googleMap } = useContext(GoogleMapsContext);
  const { position, enableRealtimeUpdate, children } = props;

  let container = useMemo<HTMLDivElement>(() => {
    return document.createElement('div');
  }, []);

  const overlayView = useMemo<google.maps.OverlayView>(() => {
    return new google.maps.OverlayView();
  }, []);

  const unmount = useCallback(() => {
    overlayView.setMap(null);
  }, [overlayView]);

  const onAdd = useCallback(() => {
    google.maps.OverlayView.preventMapHitsFrom(container);
    container.style.position = 'absolute';
    overlayView.getPanes().overlayMouseTarget.appendChild(container);
  }, [container, overlayView]);

  const draw = useCallback(() => {
    const projection = overlayView.getProjection();
    if (!projection) {
      return;
    }

    const point = projection.fromLatLngToDivPixel(position);
    container.style.left = `${point.x - 24}px`;
    container.style.top = `${point.y - 24}px`;
  }, [overlayView, container, position]);

  const onRemove = useCallback(() => {
    if (container) {
      (container.parentNode as HTMLElement).removeChild(container);
      container = null;
    }
  }, [container]);

  const initOverlay = useCallback(() => {
    overlayView.onAdd = onAdd.bind(this);
    overlayView.draw = draw.bind(this);
    overlayView.onRemove = onRemove.bind(this);

    overlayView.setMap(googleMap);
  }, [overlayView, googleMap, onAdd, draw, onRemove]);

  useEffect(() => {
    if (position && enableRealtimeUpdate) {
      draw();
      overlayView.draw = draw.bind(this);
    }
  }, [position]);

  useEffect(() => {
    initOverlay();

    return () => unmount();
  }, []);

  return createPortal(children, container);
});
