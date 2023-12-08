import { ReactNode, memo, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMap } from '../../hooks/useGoogleMap';

type Props = {
  children: ReactNode;
  position: google.maps.LatLng | null;
  open: boolean;
  onClose: () => void;
};

function InfoWindow({ children, position, open, onClose }: Props) {
  const { googleMap, loader } = useGoogleMap();

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );

  const initWindow = useCallback(async () => {
    if (!loader) {
      return;
    }

    const { InfoWindow } = await loader.importLibrary('maps');

    const window = new InfoWindow({
      content: container
    });

    setInfoWindow(window);
  }, [loader, container]);

  useEffect(() => {
    if (!container) {
      const div = document.createElement('div');

      setContainer(div);
    }
  }, [container]);

  useEffect(() => {
    if (!infoWindow && loader && container) {
      initWindow();
    }
  }, [infoWindow, loader, container, initWindow]);

  useEffect(() => {
    if (!infoWindow) {
      return;
    }

    infoWindow.addListener('closeclick', onClose);
  }, [infoWindow, onClose]);

  useEffect(() => {
    if (!infoWindow || !googleMap || !position) {
      return;
    }

    if (open) {
      infoWindow.setPosition(position);
      infoWindow.open(googleMap);
    } else {
      infoWindow.close();
    }

    return () => {
      if (infoWindow) {
        infoWindow.close();
      }
    };
  }, [infoWindow, googleMap, open, position]);

  return container && createPortal(children, container);
}

export default memo(InfoWindow);
