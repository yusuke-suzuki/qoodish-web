'use client';

import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps } from 'firebase/app';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // biome-ignore lint/correctness/useExhaustiveDependencies: searchParams is intentionally included to track page_view on query param changes
  useEffect(() => {
    if (!getApps().length) return;

    const analytics = getAnalytics();
    logEvent(analytics, 'page_view', { page_path: pathname });
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
