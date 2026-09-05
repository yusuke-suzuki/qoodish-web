import { LocationSearching, MyLocation } from '@mui/icons-material';
import { CircularProgress, IconButton } from '@mui/material';
import { memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { useGoogleMap } from '../../hooks/useGoogleMap.ts';

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
        <CircularProgress size={20} color="inherit" />
      ) : currentPosition ? (
        <MyLocation fontSize="small" sx={{ color: '#1A73E8' }} />
      ) : (
        <LocationSearching fontSize="small" />
      )}
    </IconButton>
  );
}

export default memo(CurrentPositionButton);
