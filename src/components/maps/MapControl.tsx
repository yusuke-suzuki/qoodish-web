import { ReactNode, memo, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!container) {
      const div = document.createElement('div');

      setContainer(div);
    }
  }, [container]);

  useEffect(() => {
    if (container) {
      container.style.width = fullWidth ? '100%' : 'auto';
    }
  }, [container, fullWidth]);

  return container && createPortal(children, container);
});
