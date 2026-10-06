import { Done, Edit } from '@mui/icons-material';
import { Box, Button, Chip, Stack } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import CoodinatesConverter from './CoodinatesConverter.tsx';
import GoogleMaps from './GoogleMaps.tsx';
import StaticMap from './StaticMap.tsx';

type Props = {
  onChange: (position: google.maps.LatLngLiteral) => void;
  defaultValue: google.maps.LatLngLiteral | null;
};

function PositionForm({ onChange, defaultValue }: Props) {
  const [editPosition, setEditPosition] = useState<boolean>(false);
  const [draft, setDraft] = useState<google.maps.LatLngLiteral | null>(null);
  const [saved, setSaved] = useState<google.maps.LatLngLiteral | null>(null);

  const position = saved ?? defaultValue;

  const dictionary = useDictionary();

  const handleSave = () => {
    if (draft) {
      setSaved(draft);
      onChange(draft);
    }

    setEditPosition(false);
  };

  useEffect(() => {
    if (!saved && defaultValue) {
      onChange(defaultValue);
    }
  }, [saved, defaultValue, onChange]);

  return editPosition ? (
    <Stack spacing={1}>
      <GoogleMaps
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
        sx={{
          height: 280,
          width: '100%'
        }}
        mapOptions={{
          zoomControl: false,
          streetViewControl: false,
          scaleControl: false,
          mapTypeControl: false
        }}
        center={position}
        zoom={15}
      >
        <CoodinatesConverter onChange={setDraft} defaultValue={position} />
      </GoogleMaps>

      <Stack direction="row" spacing={1}>
        <Button
          type="button"
          onClick={() => setEditPosition(false)}
          fullWidth
          variant="outlined"
          color="secondary"
          size="small"
        >
          {dictionary.cancel}
        </Button>
        <Button
          type="button"
          startIcon={<Done />}
          onClick={handleSave}
          fullWidth
          variant="contained"
          color="success"
          disabled={!draft}
          size="small"
        >
          {dictionary.save}
        </Button>
      </Stack>
    </Stack>
  ) : (
    <Box sx={{ position: 'relative' }}>
      <StaticMap position={position} width={552} height={280} />

      <Box
        sx={{
          position: 'absolute',
          zIndex: 1,
          bottom: 1,
          p: 2,
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Chip
          label={dictionary['edit position']}
          color="secondary"
          icon={<Edit fontSize="small" />}
          onClick={() => setEditPosition(true)}
        />
      </Box>
    </Box>
  );
}

export default memo(PositionForm);
