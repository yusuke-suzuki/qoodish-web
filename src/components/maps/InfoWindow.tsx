import { memo, type ReactNode, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!container) {
      const div = document.createElement('div');

      setContainer(div);
    }
  }, [container]);

  useEffect(() => {
    if (infoWindow || !loader || !container) {
      return;
    }

    let cancelled = false;

    const initWindow = async () => {
      const { InfoWindow } = await loader.importLibrary('maps');

      if (cancelled) {
        return;
      }

      setInfoWindow(
        new InfoWindow({
          content: container,
          disableAutoPan: true
        })
      );
    };

    initWindow();

    return () => {
      cancelled = true;
    };
  }, [infoWindow, loader, container]);

  useEffect(() => {
    if (!infoWindow) {
      return;
    }

    const listener = infoWindow.addListener('closeclick', onClose);

    return () => {
      listener.remove();
    };
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
