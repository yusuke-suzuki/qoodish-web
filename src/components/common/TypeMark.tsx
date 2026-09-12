import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { type ElementType, memo } from 'react';

// A height in lines, for a piece of text set in one of the theme's variants.
// The `lh` unit says this directly, but a browser that does not know it drops
// the declaration and the card goes back to being as tall as its contents; an
// em against the variant's own line height holds everywhere.
export function lines(count: number, variant: 'h6' | 'body2') {
  return (theme: Theme) =>
    `${count * Number(theme.typography[variant].lineHeight)}em`;
}

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

// Titles run from a word to a sentence, and a card whose title takes three
// lines pushes everything under it out of step with the card beside it. Two
// lines, whether or not the title fills them.
export const TYPE_TITLE_TEXT: SxProps<Theme> = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  minHeight: lines(2, 'h6')
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
        height: lines(1, 'h6'),
        flexShrink: 0
      }}
    >
      <Icon sx={{ fontSize: 22, color: 'text.secondary' }} />
    </Box>
  );
});
