import { Box, Paper, Stack, useMediaQuery, useTheme } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';
import CurrentPositionButton from './CurrentPositionButton.tsx';
import MapControl from './MapControl.tsx';
import PlaceAutocomplete from './PlaceAutocomplete.tsx';

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

  useEffect(() => {
    if (!googleMap || !loader) {
      return;
    }

    let cancelled = false;

    const initControlPositions = async () => {
      const { ControlPosition } = await loader.importLibrary('core');

      if (cancelled) {
        return;
      }

      setPacPosition(
        mdDown ? ControlPosition.TOP_CENTER : ControlPosition.TOP_LEFT
      );
      setButtonPosition(ControlPosition.RIGHT_BOTTOM);
    };

    initControlPositions();

    return () => {
      cancelled = true;
    };
  }, [googleMap, loader, mdDown]);

  useEffect(() => {
    if (!googleMap) {
      return;
    }

    const handleMapClick = () => {
      if (pacRef.current) {
        pacRef.current.blur();
      }
    };

    const clickListener = googleMap.addListener('click', handleMapClick);

    return () => {
      clickListener.remove();
    };
  }, [googleMap]);

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
        {/* The Maps API gives its own controls a 10px margin. */}
        <Stack spacing={2} sx={{ p: '10px' }}>
          <CurrentPositionButton />
        </Stack>
      </MapControl>
    </>
  );
}

export default memo(CustomMapControls);
