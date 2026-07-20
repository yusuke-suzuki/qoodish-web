'use client';

import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { memo, useEffect, useState } from 'react';
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

  // Seed with the map center so the action works even before the marker is
  // touched; reset each time the dialog opens so a prior pick does not linger.
  const [position, setPosition] =
    useState<google.maps.LatLngLiteral>(defaultCenter);

  useEffect(() => {
    if (open) {
      setPosition(defaultCenter);
    }
  }, [open, defaultCenter]);

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
        <Button variant="contained" onClick={() => onSelect(position)}>
          {dictionary.add}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(StaticMapPickerDialog);
