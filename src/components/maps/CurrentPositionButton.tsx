import { LocationSearching, MyLocation } from '@mui/icons-material';
import { CircularProgress, IconButton } from '@mui/material';
import { memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';

// The Maps API draws its own controls at 18px from the breakpoint where it
// shows them, and this button stands in the same row.
const GLYPH_SIZE = { xs: 20, md: 18 };
const PROGRESS_SIZE = 18;

function CurrentPositionButton() {
  const { googleMap, currentPosition, setCurrentPosition } = useGoogleMap();
  const dictionary = useDictionary();

  const [loading, setLoading] = useState<boolean>(false);

  const handlePosition = (position: GeolocationPosition) => {
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
  };

  const handlePositionError = (positionError: GeolocationPositionError) => {
    console.error(positionError);
    setLoading(false);
  };

  const handleClick = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handlePositionError,
      {
        enableHighAccuracy: false,
        maximumAge: 30000
      }
    );
  };

  return (
    <IconButton
      onClick={handleClick}
      aria-label={dictionary['current position']}
      // Fixed colors rather than theme tokens: the button sits among the
      // Maps API's own controls, which keep their palette in every theme.
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        bgcolor: '#fff',
        color: '#666',
        boxShadow: '0 1px 4px -1px rgba(0,0,0,0.3)',
        '&:hover': {
          bgcolor: '#fff',
          color: '#333'
        }
      }}
    >
      {loading ? (
        <CircularProgress size={PROGRESS_SIZE} color="inherit" />
      ) : currentPosition ? (
        <MyLocation sx={{ fontSize: GLYPH_SIZE, color: '#1A73E8' }} />
      ) : (
        <LocationSearching sx={{ fontSize: GLYPH_SIZE }} />
      )}
    </IconButton>
  );
}

export default memo(CurrentPositionButton);
