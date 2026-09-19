import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import InfoWindow from './InfoWindow.tsx';

type Props = {
  disableCreatePin: boolean;
  place: google.maps.places.Place | null;
  onCreatePinClick: () => void;
  onClose: () => void;
};

function PlaceInfoWindow({
  disableCreatePin,
  place,
  onCreatePinClick,
  onClose
}: Props) {
  const dictionary = useDictionary();

  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const handleCreatePinClick = () => {
    setInfoWindowOpen(false);
    onCreatePinClick();
  };

  const handleClose = () => {
    setInfoWindowOpen(false);
    onClose();
  };

  useEffect(() => {
    if (place) {
      setInfoWindowOpen(true);
    }
  }, [place]);

  return (
    <InfoWindow
      position={place ? place.location : null}
      open={infoWindowOpen}
      onClose={handleClose}
    >
      <Box
        sx={{
          width: {
            xs: 240,
            sm: 320
          }
        }}
      >
        <Typography variant="h6" gutterBottom>
          {place?.displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {place?.formattedAddress}
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          size="small"
          disabled={disableCreatePin}
          onClick={handleCreatePinClick}
          startIcon={<Add />}
        >
          {dictionary['add to map']}
        </Button>
      </Box>
    </InfoWindow>
  );
}

export default memo(PlaceInfoWindow);
