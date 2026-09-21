'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { memo, type ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  href: string;
  linkLabel: string;
};

export default memo(function SectionHeading({
  icon,
  title,
  href,
  linkLabel
}: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {icon}
      <Typography variant="subtitle1" sx={{ flex: 1, minWidth: 0 }}>
        {title}
      </Typography>
      <Button component={Link} href={href} size="small" color="secondary">
        {linkLabel}
      </Button>
    </Box>
  );
});
