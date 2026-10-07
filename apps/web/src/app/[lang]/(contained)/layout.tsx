import type { ReactNode } from 'react';
import ContainedShell from '../../../components/layouts/ContainedShell.tsx';

type Props = {
  children: ReactNode;
};

export default function ContainedLayout({ children }: Props) {
  return <ContainedShell>{children}</ContainedShell>;
}
