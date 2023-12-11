import { Add, MyLocation } from '@mui/icons-material';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import InfoWindow from './InfoWindow';

type Props = {
  disableCreateReview: boolean;
  position: google.maps.LatLng | null;
  onCreateReviewClick: () => void;
  onClose: () => void;
};

function PositionInfoWindow({
  disableCreateReview,
  position,
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
    if (position) {
      setInfoWindowOpen(true);
    }
  }, [position]);

  if (!position) {
    return null;
  }

  return (
    <InfoWindow position={position} open={infoWindowOpen} onClose={handleClose}>
      <Box
        sx={{
          width: {
            xs: 240,
            sm: 320
          }
        }}
      >
        <List>
          <ListItem>
            <ListItemIcon>
              <MyLocation />
            </ListItemIcon>
            <ListItemText secondary={`${position.lat()}, ${position.lng()}`} />
          </ListItem>
        </List>

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

export default memo(PositionInfoWindow);
