import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
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

  // The marker is an imperative map object that the effects below write to, so
  // it is held in a ref rather than in state; the flag is what lets them run
  // once it exists.
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const [ready, setReady] = useState(false);

  // The marker holds this element, so the portal has to keep rendering into
  // the same one. A lazy initial state guarantees that; useMemo does not.
  const [content] = useState<HTMLDivElement>(() =>
    document.createElement('div')
  );

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

  useEffect(() => {
    if (!googleMap || !loader) {
      return;
    }

    let cancelled = false;

    const initMarker = async () => {
      const { AdvancedMarkerElement } = await loader.importLibrary('marker');

      if (cancelled) {
        return;
      }

      const marker = new AdvancedMarkerElement({
        map: googleMap,
        content: content
      });

      marker.element.style.cursor = 'pointer';
      markerRef.current = marker;

      setReady(true);
    };

    initMarker();

    return () => {
      cancelled = true;

      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }

      setReady(false);
    };
  }, [googleMap, loader, content]);

  useEffect(() => {
    const element = markerRef.current?.element;

    if (!ready || !element) {
      return;
    }

    // markerView.addListener でイベントを設定してしまうと
    // マーカー付近をタップしてのマップ移動操作を受け付けなくなってしまうため、
    // element に対して listener を設定する
    element.addEventListener('click', handleClick);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ready, handleClick, handleMouseEnter, handleMouseLeave]);

  useEffect(() => {
    const marker = markerRef.current;

    if (!ready || !marker || !position) {
      return;
    }

    marker.position = position;
  }, [ready, position]);

  return createPortal(children, content);
});
