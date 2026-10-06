import { memo, type ReactNode, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import useHydrated from '../../hooks/useHydrated.ts';

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
  const hydrated = useHydrated();

  const container = useMemo(() => {
    if (!hydrated) {
      return null;
    }

    const div = document.createElement('div');
    div.style.width = fullWidth ? '100%' : 'auto';

    return div;
  }, [hydrated, fullWidth]);

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

  return container && createPortal(children, container);
});
