import { LocationOn } from '@mui/icons-material';
import { Box, IconButton, Paper } from '@mui/material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';
import MapControl from './MapControl';
import MarkerView from './MarkerView';
import PlaceAutocomplete from './PlaceAutocomplete';

type Props = {
  onChange: (center: google.maps.LatLngLiteral) => void;
  defaultValue?: google.maps.LatLngLiteral;
};

function CoodinatesConverter({ onChange, defaultValue }: Props) {
  const { loader } = useGoogleMapsApi();
  const { googleMap } = useGoogleMap();

  const pacRef = useRef<HTMLInputElement | null>(null);

  const [center, setCenter] = useState<google.maps.LatLng | null>(null);
  const [pacPosition, setPacPosition] =
    useState<google.maps.ControlPosition | null>(null);

  const handleCenterChanged = useCallback(() => {
    if (!googleMap) {
      return;
    }

    const center = googleMap.getCenter();

    setCenter(center);

    onChange({
      lat: center.lat(),
      lng: center.lng()
    });
  }, [googleMap, onChange]);

  const handlePlaceChange = useCallback(
    (place: google.maps.places.Place) => {
      if (!googleMap || !place) {
        return;
      }

      googleMap.setCenter(place.location);
    },
    [googleMap]
  );

  const initControlPosition = useCallback(async () => {
    if (!googleMap || !loader) {
      return;
    }

    const { ControlPosition } = await loader.importLibrary('core');

    setPacPosition(ControlPosition.TOP_CENTER);
  }, [googleMap, loader]);

  const initDefaultCenter = useCallback(async () => {
    if (!googleMap || !loader || !defaultValue) {
      return;
    }

    const { LatLng } = await loader.importLibrary('core');

    const latLng = new LatLng(defaultValue.lat, defaultValue.lng);

    setCenter(latLng);
  }, [googleMap, loader, defaultValue]);

  useEffect(() => {
    if (!googleMap) {
      return;
    }

    const listener = googleMap.addListener(
      'center_changed',
      handleCenterChanged
    );

    return () => {
      listener.remove();
    };
  }, [googleMap, handleCenterChanged]);

  useEffect(() => {
    if (googleMap && loader) {
      initControlPosition();
    }
  }, [googleMap, loader, initControlPosition]);

  useEffect(() => {
    if (defaultValue && googleMap && loader) {
      initDefaultCenter();
    }
  }, [defaultValue, googleMap, loader, initDefaultCenter]);

  return (
    <>
      <MapControl controlPosition={pacPosition} fullWidth>
        <Box sx={{ p: 2 }}>
          <Paper>
            <PlaceAutocomplete onChange={handlePlaceChange} ref={pacRef} />
          </Paper>
        </Box>
      </MapControl>

      <MarkerView position={center}>
        <IconButton size="large">
          <LocationOn color="error" fontSize="large" />
        </IconButton>
      </MarkerView>
    </>
  );
}

export default memo(CoodinatesConverter);
