import { memo, type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import useHydrated from '../../hooks/useHydrated.ts';

type Props = {
  children: ReactNode;
  controlPosition: google.maps.ControlPosition | null;
  fullWidth?: boolean;
};

function MountedMapControl({ children, controlPosition, fullWidth }: Props) {
  const { googleMap } = useGoogleMap();

  const [container] = useState(() => document.createElement('div'));

  useEffect(() => {
    if (googleMap && controlPosition) {
      googleMap.controls[controlPosition].push(container);
    }

    return () => {
      if (googleMap && controlPosition) {
        googleMap.controls[controlPosition].clear();
      }
    };
  }, [googleMap, controlPosition, container]);

  useEffect(() => {
    // biome-ignore lint/nursery/useReactCompiler: the container is a DOM node handed to the Maps API, whose control layout reads its width; React never reads it.
    container.style.width = fullWidth ? '100%' : 'auto';
  }, [container, fullWidth]);

  return createPortal(children, container);
}

export default memo(function MapControl(props: Props) {
  return useHydrated() ? <MountedMapControl {...props} /> : null;
});
