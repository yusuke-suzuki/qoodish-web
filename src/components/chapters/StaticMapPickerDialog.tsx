'use client';

import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import CoodinatesConverter from '../maps/CoodinatesConverter';
import GoogleMaps from '../maps/GoogleMaps';

type Props = {
  open: boolean;
  defaultCenter: google.maps.LatLngLiteral;
  onClose: () => void;
  onSelect: (position: google.maps.LatLngLiteral) => void;
};

function StaticMapPickerDialog({
  open,
  defaultCenter,
  onClose,
  onSelect
}: Props) {
  const dictionary = useDictionary();

  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{dictionary['insert map']}</DialogTitle>

      <GoogleMaps
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
        sx={{ height: 360, width: '100%' }}
        mapOptions={{
          zoomControl: false,
          streetViewControl: false,
          scaleControl: false,
          mapTypeControl: false
        }}
        center={defaultCenter}
        zoom={15}
      >
        <CoodinatesConverter
          onChange={setPosition}
          defaultValue={defaultCenter}
        />
      </GoogleMaps>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          disabled={!position}
          onClick={() => {
            if (position) {
              onSelect(position);
            }
          }}
        >
          {dictionary.add}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(StaticMapPickerDialog);
