'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Rendered on the server before hydration, where the viewer's time zone is
// unknown. A non-breaking space keeps the line height so the text appears
// without shifting the layout. Written as an escape because a literal
// non-breaking space is indistinguishable from a regular one in source.
export const LOCAL_DATE_TIME_PLACEHOLDER = '\u00A0';

/**
 * Formats a timestamp in the viewer's locale and time zone.
 *
 * Formatting during server rendering would use the server's time zone, which
 * puts a timestamp near midnight on a different calendar day than the browser
 * resolves it to. Formatting only after mount keeps the two renders identical.
 */
export default function useLocalDateTime() {
  const { lang } = useParams<{ lang: string }>();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (value: string, options: Intl.DateTimeFormatOptions) =>
    mounted
      ? new Intl.DateTimeFormat(lang, options).format(new Date(value))
      : LOCAL_DATE_TIME_PLACEHOLDER;
}
