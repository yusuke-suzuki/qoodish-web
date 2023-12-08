import {
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMap } from '../../hooks/useGoogleMap';

type Props = {
  children: ReactNode;
  position: google.maps.LatLng | null;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export default memo(function MarkerView({
  children,
  position,
  onClick,
  onMouseEnter,
  onMouseLeave
}: Props) {
  const { loader, googleMap } = useGoogleMap();
  const [markerView, setMarkerView] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const content = useMemo<HTMLDivElement>(() => {
    return document.createElement('div');
  }, []);

  const handleClick = useCallback(() => {
    if (!onClick) {
      return;
    }

    onClick();
  }, [onClick]);

  const handleMouseEnter = useCallback(() => {
    if (!onMouseEnter) {
      return;
    }

    onMouseEnter();
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    if (!onMouseLeave) {
      return;
    }

    onMouseLeave();
  }, [onMouseLeave]);

  const initMarker = useCallback(async () => {
    const { AdvancedMarkerElement } = await loader.importLibrary('marker');

    setMarkerView(
      new AdvancedMarkerElement({
        map: googleMap,
        content: content
      })
    );
  }, [googleMap, content, loader]);

  useEffect(() => {
    if (!markerView || !markerView.element) {
      return;
    }

    // markerView.addListener でイベントを設定してしまうと
    // マーカー付近をタップしてのマップ移動操作を受け付けなくなってしまうため、
    // element に対して listener を設定する
    markerView.element.addEventListener('click', handleClick);
    markerView.element.addEventListener('mouseenter', handleMouseEnter);
    markerView.element.addEventListener('mouseleave', handleMouseLeave);
    markerView.element.style.cursor = 'pointer';

    return () => {
      if (markerView?.element) {
        markerView.element.removeEventListener('click', handleClick);
        markerView.element.removeEventListener('mouseenter', handleMouseEnter);
        markerView.element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [markerView, handleClick, handleMouseEnter, handleMouseLeave]);

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
    if (markerView && position) {
      markerView.position = position;
    }
  }, [markerView, position]);

  return createPortal(children, content);
});
