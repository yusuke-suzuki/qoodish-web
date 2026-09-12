import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { type ElementType, memo } from 'react';

// Laid on a card title, for the three things a reader meets in a list: which
// of them this one is.
//
// The row aligns to its top rather than its centre, and the mark is centred
// inside a box one line tall. Centring the row itself is right until the title
// wraps, at which point the mark floats between the two lines; this holds it to
// the first one, whatever the title's length.
export const TYPE_TITLE: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1
};

type Props = {
  icon: ElementType;
};

export default memo(function TypeMark({ icon: Icon }: Props) {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '1lh',
        flexShrink: 0
      }}
    >
      <Icon sx={{ fontSize: 22, color: 'text.secondary' }} />
    </Box>
  );
});
