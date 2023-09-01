import { Typography, useMediaQuery, useTheme } from '@mui/material';
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

export default memo(function Logo({ color }: Props) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Typography
      variant={smUp ? 'h4' : 'h5'}
      color={color ? color : 'primary'}
      sx={{
        fontFamily: "'Lobster', cursive"
      }}
    >
      Qoodish
    </Typography>
  );
});
