import { Box, Paper } from '@mui/material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import DraggableMarker from './DraggableMarker';
import MapControl from './MapControl';
import PlaceAutocomplete from './PlaceAutocomplete';

type Props = {
  onChange: (center: google.maps.LatLngLiteral) => void;
  defaultValue?: google.maps.LatLngLiteral | null;
};

function CoodinatesConverter({ onChange, defaultValue }: Props) {
  const { googleMap, loader } = useGoogleMap();

  const pacRef = useRef<HTMLInputElement | null>(null);

  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [defaultPosition, setDefaultPosition] = useState<
    google.maps.LatLngLiteral | google.maps.LatLng | null
  >(null);
  const [pacPosition, setPacPosition] =
    useState<google.maps.ControlPosition | null>(null);

  const handlePlaceChange = useCallback(
    (place: google.maps.places.Place) => {
      if (!googleMap || !place || !place.location) {
        return;
      }

      googleMap.setCenter(place.location);

      setDefaultPosition(place.location);
      setCenter({
        lat: place.location.lat(),
        lng: place.location.lng()
      });
    },
    [googleMap]
  );

  const initControlPosition = useCallback(async () => {
    if (!loader) {
      return;
    }

    const { ControlPosition } = await loader.importLibrary('core');

    setPacPosition(ControlPosition.TOP_CENTER);
  }, [loader]);

  useEffect(() => {
    if (googleMap && loader) {
      initControlPosition();
    }
  }, [googleMap, loader, initControlPosition]);

  useEffect(() => {
    if (center) {
      onChange(center);
    }
  }, [center, onChange]);

  useEffect(() => {
    if (defaultValue) {
      setDefaultPosition(defaultValue);
      setCenter(defaultValue);
    }
  }, [defaultValue]);

  return (
    <>
      <MapControl controlPosition={pacPosition} fullWidth>
        <Box sx={{ p: 2 }}>
          <Paper>
            <PlaceAutocomplete onChange={handlePlaceChange} ref={pacRef} />
          </Paper>
        </Box>
      </MapControl>

      <DraggableMarker
        defaultPosition={defaultPosition}
        onLatLngChanged={setCenter}
      />
    </>
  );
}

export default memo(CoodinatesConverter);
