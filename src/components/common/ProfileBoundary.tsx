'use client';

import { type ReactNode, Suspense } from 'react';
import type { Profile } from '../../../types/index.ts';
import useProfile from '../../hooks/useProfile.ts';

type Props = {
  children: (profile: Profile | null) => ReactNode;
};

function ResolvedProfile({ children }: Props) {
  return <>{children(useProfile())}</>;
}

export default function ProfileBoundary({ children }: Props) {
  return (
    <Suspense fallback={children(null)}>
      <ResolvedProfile>{children}</ResolvedProfile>
    </Suspense>
  );
}
