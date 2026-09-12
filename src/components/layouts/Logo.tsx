import { Typography } from '@mui/material';
import { memo } from 'react';

type Props = {
  color?:
    | 'inherit'
    | 'initial'
    | 'primary'
    | 'secondary'
    | 'textPrimary'
    | 'textSecondary'
    | 'error';
};

// Sized in CSS rather than from a media query read after mount: on the server
// the query matches nothing, so the wordmark rendered small and grew once the
// page came alive, taking the bar's contents with it. Only the size is taken
// from the larger variant — the whole of it would bring the heading face along
// and the mark would stop being the mark.
//
// A span, not the heading the size once implied: the mark names the site in
// the chrome, and an h4 above a page's own h1 is a heading of nothing.
export default memo(function Logo({ color }: Props) {
  return (
    <Typography
      variant="h5"
      component="span"
      color={color ? color : 'primary'}
      sx={(theme) => ({
        fontFamily: 'var(--font-lobster), cursive',
        [theme.breakpoints.up('sm')]: {
          fontSize: theme.typography.h4.fontSize
        }
      })}
    >
      Qoodish
    </Typography>
  );
});
