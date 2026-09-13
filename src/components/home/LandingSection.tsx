import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function LandingSection({ children }: Props) {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}
