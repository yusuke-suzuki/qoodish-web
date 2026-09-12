import { Box, Container } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  sx?: SxProps<Theme>;
};

// Every band on the landing runs the full width of the page and carries its own
// ground, so the page reads as a sequence of surfaces rather than one column
// standing on a single colour.
export default function LandingSection({ children, sx }: Props) {
  return (
    <Box
      component="section"
      sx={[{ py: { xs: 8, md: 14 } }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}
