'use client';

import { Typography } from '@mui/material';
import { memo } from 'react';

type Props = {
  children: string;
  component: 'h2' | 'h3';
};

// The name of a list is not a message, and the landing keeps the two apart:
// the poster sizes are reserved for the sentences the page is making, and
// every list on the page is named at this one rank instead.
export default memo(function LandingListLabel({ children, component }: Props) {
  return (
    <Typography
      variant="subtitle2"
      component={component}
      sx={{ mb: 2, opacity: 0.7 }}
    >
      {children}
    </Typography>
  );
});
