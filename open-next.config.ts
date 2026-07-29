import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived'
  }),
  // Without a queue the default implementation throws on every ISR
  // revalidation, freezing /sitemap.xml at its build-time content.
  // The in-memory queue can revalidate the same route more than once
  // across isolates, which is harmless for a single low-frequency route.
  queue: memoryQueue
});
