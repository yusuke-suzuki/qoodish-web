import { MyLocation } from '@mui/icons-material';
import { Box, CircularProgress, Fab } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import { useGoogleMap } from '../../hooks/useGoogleMap';

function CurrentPositionButton() {
  const { googleMap, setCurrentPosition } = useGoogleMap();

  const [loading, setLoading] = useState<boolean>(false);

  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      setLoading(false);

      if (!googleMap) {
        return;
      }

      setCurrentPosition(position);

      googleMap.panTo({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      googleMap.setZoom(17);
    },
    [googleMap, setCurrentPosition]
  );

  const handlePositionError = useCallback(
    (positionError: GeolocationPositionError) => {
      console.error(positionError);
      setLoading(false);
    },
    []
  );

  const handleClick = useCallback(() => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handlePositionError,
      {
        enableHighAccuracy: false,
        maximumAge: 30000
      }
    );
  }, [handlePosition, handlePositionError]);

  return (
    <Box position="relative">
      <Fab
        onClick={handleClick}
        sx={{
          bgcolor: 'background.paper'
        }}
      >
        <MyLocation fontSize="small" />
      </Fab>
      {loading && (
        <CircularProgress
          size={68}
          sx={{
            color: 'info.main',
            position: 'absolute',
            top: -6,
            left: -6,
            zIndex: 1
          }}
        />
      )}
    </Box>
  );
}

export default memo(CurrentPositionButton);
