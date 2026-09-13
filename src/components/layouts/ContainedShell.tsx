import { Container } from '@mui/material';
import type { ReactNode } from 'react';
import Footer from './Footer.tsx';

type Props = {
  children: ReactNode;
};

export default function ContainedShell({ children }: Props) {
  return (
    <>
      <Container sx={{ py: { xs: 2, md: 4 } }}>{children}</Container>

      <Footer />
    </>
  );
}
