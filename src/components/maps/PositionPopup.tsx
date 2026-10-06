import { Add, MyLocation } from '@mui/icons-material';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import MapPopup from './MapPopup.tsx';

type Props = {
  disableCreatePin: boolean;
  position: google.maps.LatLng | null;
  onCreatePinClick: () => void;
  onClose: () => void;
};

function PositionPopup({
  disableCreatePin,
  position,
  onCreatePinClick,
  onClose
}: Props) {
  const dictionary = useDictionary();

  const [dismissed, setDismissed] = useState<google.maps.LatLng | null>(null);
  const popupOpen = position !== null && position !== dismissed;

  const handleCreatePinClick = () => {
    setDismissed(position);
    onCreatePinClick();
  };

  const handleClose = () => {
    setDismissed(position);
    onClose();
  };

  if (!position) {
    return null;
  }

  const coordinates = `${position.lat()}, ${position.lng()}`;

  return (
    <MapPopup
      label={coordinates}
      position={position}
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
        <List>
          <ListItem>
            <ListItemIcon>
              <MyLocation />
            </ListItemIcon>
            <ListItemText secondary={coordinates} />
          </ListItem>
        </List>

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

export default memo(PositionPopup);
