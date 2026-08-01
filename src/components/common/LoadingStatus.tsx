'use client';

import { Box } from '@mui/material';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  loading: boolean;
};

// Skeletons already carry the loading state visually, so the live region
// stays in the accessibility tree only.
export default memo(function LoadingStatus({ loading }: Props) {
  const dictionary = useDictionary();

  return (
    <Box
      component="output"
      sx={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}
    >
      {loading ? dictionary.loading : ''}
    </Box>
  );
});
