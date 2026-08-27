import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';

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
  const [content] = useState<HTMLDivElement>(() => {
    const element = document.createElement('div');
    element.style.cursor = 'pointer';

    return element;
  });

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
    // Turning on gmpClickable to use gmp-click makes the marker swallow taps
    // around it, which stops the visitor panning the map from there, so the
    // listeners go on the content this component renders itself.
    content.addEventListener('click', handleClick);
    content.addEventListener('mouseenter', handleMouseEnter);
    content.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      content.removeEventListener('click', handleClick);
      content.removeEventListener('mouseenter', handleMouseEnter);
      content.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [content, handleClick, handleMouseEnter, handleMouseLeave]);

  useEffect(() => {
    const marker = markerRef.current;

    if (!ready || !marker || !position) {
      return;
    }

    marker.position = position;
  }, [ready, position]);

  return createPortal(children, content);
});
