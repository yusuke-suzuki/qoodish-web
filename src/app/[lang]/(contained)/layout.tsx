import type { ReactNode } from 'react';
import ContainedShell from '../../../components/layouts/ContainedShell.tsx';

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function ContainedLayout({ children, params }: Props) {
  const { lang } = await params;

  return <ContainedShell lang={lang}>{children}</ContainedShell>;
}
