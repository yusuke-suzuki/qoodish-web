import { Container } from '@mui/material';
import type { ReactNode } from 'react';
import Footer from '../../../components/layouts/Footer.tsx';

type Props = {
  children: ReactNode;
};

// The legal documents used to sit in the app's grid, which stood a rail of
// popular maps beside the terms of service and held the text to two thirds of
// the page. They read on their own measure instead.
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
