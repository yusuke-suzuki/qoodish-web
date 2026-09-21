import { Container } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function ContainedShell({ children }: Props) {
  return <Container sx={{ py: { xs: 2, md: 4 } }}>{children}</Container>;
}
