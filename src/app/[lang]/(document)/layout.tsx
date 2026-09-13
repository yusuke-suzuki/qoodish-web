import { Container } from '@mui/material';
import type { ReactNode } from 'react';
import Footer from '../../../components/layouts/Footer.tsx';

type Props = {
  children: ReactNode;
};

export default function DocumentLayout({ children }: Props) {
  return (
    <>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        {children}
      </Container>

      <Footer />
    </>
  );
}
