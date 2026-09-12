import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// The bands share the page's surface and are told apart by the space around
// them, so the rhythm lives here rather than in a ground colour per section.
export default function LandingSection({ children }: Props) {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}
