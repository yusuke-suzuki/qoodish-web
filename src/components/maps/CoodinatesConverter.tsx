import { Box, Paper } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import DraggableMarker from './DraggableMarker.tsx';
import MapControl from './MapControl.tsx';
import PlaceAutocomplete from './PlaceAutocomplete.tsx';

type Props = {
  onChange: (center: google.maps.LatLngLiteral) => void;
  defaultValue?: google.maps.LatLngLiteral | null;
};

function CoodinatesConverter({ onChange, defaultValue }: Props) {
  const { googleMap, loader } = useGoogleMap();

  const dictionary = useDictionary();

  const pacRef = useRef<HTMLInputElement | null>(null);

  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [defaultPosition, setDefaultPosition] = useState<
    google.maps.LatLngLiteral | google.maps.LatLng | null
  >(null);
  const [pacPosition, setPacPosition] =
    useState<google.maps.ControlPosition | null>(null);

  const handlePlaceChange = (place: google.maps.places.Place) => {
    if (!googleMap || !place?.location) {
      return;
    }

    googleMap.setCenter(place.location);

    setDefaultPosition(place.location);
    setCenter({
      lat: place.location.lat(),
      lng: place.location.lng()
    });
  };

  useEffect(() => {
    if (!googleMap || !loader) {
      return;
    }

    let cancelled = false;

    const initControlPosition = async () => {
      const { ControlPosition } = await loader.importLibrary('core');

      if (cancelled) {
        return;
      }

      setPacPosition(ControlPosition.TOP_CENTER);
    };

    initControlPosition();

    return () => {
      cancelled = true;
    };
  }, [googleMap, loader]);

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
            <PlaceAutocomplete
              onChange={handlePlaceChange}
              ref={pacRef}
              label={dictionary['search places']}
            />
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
