import { randomUUID } from 'node:crypto';
import { serwist } from '@serwist/next/config';
import { LOCALES } from './src/utils/locales.ts';
import { offlinePath } from './src/utils/offline.ts';

const offlinePageRevision = randomUUID();

export default serwist({
  swSrc: 'src/worker/index.ts',
  swDest: 'public/sw.js',
  precachePrerendered: false,
  additionalPrecacheEntries: LOCALES.map((locale) => ({
    url: offlinePath(locale),
    revision: offlinePageRevision
  })),
  // Cloudflare's asset host consumes _headers instead of serving it, so a
  // precache entry for it never resolves and stalls the worker install.
  globIgnores: ['public/_headers']
});
