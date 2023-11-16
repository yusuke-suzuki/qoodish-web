import { Lock } from '@mui/icons-material';
import { Chip, Typography } from '@mui/material';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';

function PrivateMapChip() {
  const dictionary = useDictionary();

  return (
    <Chip
      key="private"
      icon={<Lock fontSize="small" />}
      label={
        <Typography variant="caption" color="text.secondary">
          {dictionary.private}
        </Typography>
      }
      size="small"
    />
  );
}

export default memo(PrivateMapChip);
