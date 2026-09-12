import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { type ElementType, memo } from 'react';

type Props = {
  icon: ElementType;
  sx?: SxProps<Theme>;
};

// What stands in for a picture that was never uploaded. One shape for maps,
// reports and chapters alike: only the icon says which of the three it is.
export default memo(function MediaPlaceholder({ icon: Icon, sx }: Props) {
  return (
    <Box
      sx={[
        {
          aspectRatio: '3 / 2',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover'
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      <Icon color="disabled" fontSize="large" />
    </Box>
  );
});
