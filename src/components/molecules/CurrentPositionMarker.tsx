import React, { useContext, useEffect, useCallback, useState } from 'react';
import GoogleMapsContext from '../../GoogleMapsContext';
import { useMappedState } from 'redux-react-hook';
import I18n from '../../utils/I18n';

const CurrentPositionMarker = () => {
  const { googleMapsApi, gMap } = useContext(GoogleMapsContext);
  const [currentPositionMarker, setCurrentPositionMarker] = useState(undefined);

  const mapState = useCallback(
    state => ({
      currentPosition: state.gMap.currentPosition
    }),
    []
  );
  const { currentPosition } = useMappedState(mapState);

  const createCurrentPositionMarker = useCallback(() => {
    const marker = new googleMapsApi.Marker({
      position: {
        lat: parseFloat(currentPosition.lat),
        lng: parseFloat(currentPosition.lng)
      },
      icon: {
        path: googleMapsApi.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#0088ff',
        fillOpacity: 0.8,
        strokeColor: '#0088ff',
        strokeOpacity: 0.2
      },
      title: I18n.t('you are hear')
    });

    marker.setMap(gMap);
    setCurrentPositionMarker(marker);
  }, [currentPosition, googleMapsApi, gMap]);

  const removeCurrentPositionMarker = useCallback(() => {
    currentPositionMarker.setMap(null);
  }, [currentPositionMarker]);

  useEffect(() => {
    if (!googleMapsApi || !currentPosition.lat || !gMap) {
      return;
    }
    createCurrentPositionMarker();

    return () => {
      if (currentPositionMarker) {
        removeCurrentPositionMarker();
      }
    };
  }, [currentPosition]);

  return null;
};

export default React.memo(CurrentPositionMarker);
