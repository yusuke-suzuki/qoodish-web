import React, { useState, useEffect, useCallback, useContext } from 'react';
import ReactDOM from 'react-dom';
import GoogleMapsContext from '../../GoogleMapsContext';

type Props = {
  position: any;
  children: JSX.Element;
};

const OverlayView: React.FC<Props> = props => {
  const { googleMapsApi, gMap } = useContext(GoogleMapsContext);
  const { position, children } = props;

  const [container, setContainer] = useState(document.createElement('div'));
  const [overlay, setOverlay] = useState(undefined);

  const initOverlay = useCallback(() => {
    const overlayView = new googleMapsApi.OverlayView();
    overlayView.setMap(gMap);
    setOverlay(overlayView);
    googleMapsApi.OverlayView.preventMapHitsFrom(container);
  }, [googleMapsApi, gMap, container]);

  const onAdd = useCallback(() => {
    container.style.position = 'absolute';
    overlay.getPanes().overlayMouseTarget.appendChild(container);
  }, [overlay]);

  const draw = useCallback(() => {
    const divPosition = overlay.getProjection().fromLatLngToDivPixel(position);
    container.style.left = `${divPosition.x - 40}px`;
    container.style.top = `${divPosition.y - 40}px`;
  }, [overlay, container, position]);

  const onRemove = useCallback(() => {
    ReactDOM.unmountComponentAtNode(container);
    setContainer(undefined);
    overlay.setMap(null);
  }, [container, overlay]);

  const bindFunctions = useCallback(() => {
    overlay.onAdd = onAdd.bind(this);
    overlay.draw = draw.bind(this);
    overlay.onRemove = onRemove.bind(this);
  }, [overlay]);

  useEffect(() => {
    if (overlay) {
      bindFunctions();
    }
  }, [overlay]);

  useEffect(() => {
    initOverlay();
  }, []);

  return ReactDOM.createPortal(children, container);
};

export default React.memo(OverlayView);
