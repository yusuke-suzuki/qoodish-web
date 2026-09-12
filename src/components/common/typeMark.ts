import type { SxProps, Theme } from '@mui/material/styles';

// How a card marks which of the three things it is. The mark runs inside the
// title rather than beside it, where it would align to the baseline and ride
// above a heading whose caps are shorter than an icon.
//
// `middle` is not the middle here: it centres the icon against the x-height,
// 0.25em above the baseline, while the ink of this heading centres at 0.33em
// in Cinzel and 0.4em in the mincho — so the mark read as sitting low under
// Japanese titles. Lowering the icon's own baseline by 0.1em puts its centre
// at 0.36em, within a pixel of both scripts.
export const TYPE_MARK: SxProps<Theme> = {
  fontSize: 18,
  color: 'text.secondary',
  verticalAlign: '-0.1em',
  mr: 1
};
