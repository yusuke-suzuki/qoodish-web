'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { trackEvent } from '../../utils/analytics.ts';

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // biome-ignore lint/correctness/useExhaustiveDependencies: searchParams is intentionally included to track page_view on query param changes
  useEffect(() => {
    trackEvent({ name: 'page_view', params: { page_path: pathname } });
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense>
      <Tracker />
    </Suspense>
  );
}
