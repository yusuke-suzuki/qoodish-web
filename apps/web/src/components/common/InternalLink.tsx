'use client';

import { Link } from '@mui/material';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
};

export default function InternalLink({ href, children }: Props) {
  return (
    <Link component={NextLink} href={href}>
      {children}
    </Link>
  );
}
