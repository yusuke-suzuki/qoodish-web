import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import InfoWindow from './InfoWindow';

type Props = {
  disableCreateReview: boolean;
  place: google.maps.places.Place | null;
  onCreateReviewClick: () => void;
  onClose: () => void;
};

function PlaceInfoWindow({
  disableCreateReview,
  place,
  onCreateReviewClick,
  onClose
}: Props) {
  const dictionary = useDictionary();

  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const handleCreateReviewClick = useCallback(() => {
    setInfoWindowOpen(false);
    onCreateReviewClick();
  }, [onCreateReviewClick]);

  const handleClose = useCallback(() => {
    setInfoWindowOpen(false);
    onClose();
  }, [onClose]);

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
          disabled={disableCreateReview}
          onClick={handleCreateReviewClick}
          startIcon={<Add />}
        >
          {dictionary['add new spot']}
        </Button>
      </Box>
    </InfoWindow>
  );
}

export default memo(PlaceInfoWindow);
