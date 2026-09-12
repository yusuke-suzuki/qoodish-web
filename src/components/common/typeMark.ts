import type { SxProps, Theme } from '@mui/material/styles';

// How a card marks which of the three things it is. The mark runs inside the
// title rather than beside it: set as a box of its own it aligns to the
// baseline, and the caps of a heading do not reach as high as an icon does, so
// it read as sitting too high.
export const TYPE_MARK: SxProps<Theme> = {
  fontSize: 18,
  color: 'text.secondary',
  verticalAlign: 'middle',
  mr: 1
};
