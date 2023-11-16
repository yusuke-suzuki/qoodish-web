import { Done, Edit } from '@mui/icons-material';
import { Box, Button, Chip, Stack } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import CoodinatesConverter from './CoodinatesConverter';
import GoogleMaps from './GoogleMaps';
import StaticMap from './StaticMap';

type Props = {
  onChange: (position: google.maps.LatLngLiteral) => void;
  defaultValue?: google.maps.LatLngLiteral;
};

function PositionForm({ onChange, defaultValue }: Props) {
  const [editPosition, setEditPosition] = useState<boolean>(false);
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null
  );

  const dictionary = useDictionary();

  const handleSave = useCallback(() => {
    onChange(position);

    setEditPosition(false);
  }, [position, onChange]);

  useEffect(() => {
    if (defaultValue) {
      onChange(defaultValue);
    }
  }, [defaultValue, onChange]);

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
        center={defaultValue}
        zoom={15}
      >
        <CoodinatesConverter
          onChange={setPosition}
          defaultValue={defaultValue}
        />
      </GoogleMaps>

      <Stack direction="row" spacing={1}>
        <Button
          onClick={() => setEditPosition(false)}
          fullWidth
          variant="outlined"
          color="secondary"
          size="small"
        >
          {dictionary.cancel}
        </Button>
        <Button
          startIcon={<Done />}
          onClick={handleSave}
          fullWidth
          variant="contained"
          color="success"
          disabled={!position}
          size="small"
        >
          {dictionary.save}
        </Button>
      </Stack>
    </Stack>
  ) : (
    <Box sx={{ position: 'relative' }}>
      <StaticMap position={position || defaultValue} width={552} height={280} />

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
