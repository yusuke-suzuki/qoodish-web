import { memo, type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMap } from '../../hooks/useGoogleMap';

type Props = {
  children: ReactNode;
  controlPosition: google.maps.ControlPosition | null;
  fullWidth?: boolean;
};

export default memo(function MapControl({
  children,
  controlPosition,
  fullWidth
}: Props) {
  const { googleMap } = useGoogleMap();

  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (googleMap && controlPosition && container) {
      googleMap.controls[controlPosition].push(container);
    }

    return () => {
      if (googleMap && controlPosition && container) {
        googleMap.controls[controlPosition].clear();
      }
    };
  }, [googleMap, controlPosition, container]);

  // The width is set on the element the map positions, so it has to go on the
  // container itself. Building a fresh one keeps the element out of state that
  // is later written to.
  useEffect(() => {
    const div = document.createElement('div');
    div.style.width = fullWidth ? '100%' : 'auto';

    setContainer(div);
  }, [fullWidth]);

  return container && createPortal(children, container);
});
