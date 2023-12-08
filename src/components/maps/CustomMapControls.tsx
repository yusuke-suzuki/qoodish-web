import { Box, Paper, Stack, useMediaQuery, useTheme } from '@mui/material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import { useGoogleMap } from '../../hooks/useGoogleMap';
import CurrentPositionButton from './CurrentPositionButton';
import MapControl from './MapControl';
import PlaceAutocomplete from './PlaceAutocomplete';

type Props = {
  onPlaceChange: (place: google.maps.places.Place) => void;
};

function CustomMapControls({ onPlaceChange }: Props) {
  const { googleMap, loader } = useGoogleMap();

  const dictionary = useDictionary();

  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));

  const pacRef = useRef<HTMLInputElement | null>(null);

  const [pacPosition, setPacPosition] =
    useState<google.maps.ControlPosition | null>(null);
  const [buttonPosition, setButtonPosition] =
    useState<google.maps.ControlPosition | null>(null);

  const handleMapClick = useCallback(() => {
    if (pacRef.current) {
      pacRef.current.blur();
    }
  }, []);

  const initControlPositions = useCallback(async () => {
    if (!googleMap || !loader) {
      return;
    }

    const { ControlPosition } = await loader.importLibrary('core');

    setPacPosition(
      mdDown ? ControlPosition.TOP_CENTER : ControlPosition.TOP_LEFT
    );
    setButtonPosition(ControlPosition.RIGHT_BOTTOM);
  }, [googleMap, loader, mdDown]);

  useEffect(() => {
    if (googleMap && loader) {
      initControlPositions();
    }
  }, [googleMap, loader, initControlPositions]);

  useEffect(() => {
    if (!googleMap) {
      return;
    }

    const clickListener = googleMap.addListener('click', handleMapClick);

    return () => {
      clickListener.remove();
    };
  }, [googleMap, handleMapClick]);

  return (
    <>
      <MapControl controlPosition={pacPosition} fullWidth={mdDown}>
        <Box
          sx={{
            p: 2
          }}
        >
          <Paper>
            <PlaceAutocomplete
              ref={pacRef}
              onChange={onPlaceChange}
              label={dictionary['search places to add']}
            />
          </Paper>
        </Box>
      </MapControl>

      <MapControl controlPosition={buttonPosition}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <CurrentPositionButton />
        </Stack>
      </MapControl>
    </>
  );
}

export default memo(CustomMapControls);
