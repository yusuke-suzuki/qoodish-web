import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import MapPopup from './MapPopup.tsx';

type Props = {
  disableCreatePin: boolean;
  place: google.maps.places.Place | null;
  onCreatePinClick: () => void;
  onClose: () => void;
};

function PlacePopup({
  disableCreatePin,
  place,
  onCreatePinClick,
  onClose
}: Props) {
  const dictionary = useDictionary();

  const [dismissed, setDismissed] = useState<google.maps.places.Place | null>(
    null
  );
  const popupOpen = place !== null && place !== dismissed;

  const handleCreatePinClick = () => {
    setDismissed(place);
    onCreatePinClick();
  };

  const handleClose = () => {
    setDismissed(place);
    onClose();
  };

  return (
    <MapPopup
      label={place?.displayName ?? ''}
      position={place?.location ?? null}
      open={popupOpen}
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
    </MapPopup>
  );
}

export default memo(PlacePopup);
