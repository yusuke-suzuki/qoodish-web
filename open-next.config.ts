import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived'
  }),
  // Without a queue the default implementation throws on every ISR
  // revalidation, freezing /sitemap.xml at its build-time content.
  queue: doQueue,
  // Tags have to outlive the isolate that wrote them, or a revalidateTag
  // from one request is invisible to the next.
  tagCache: doShardedTagCache({ baseShardSize: 12, regionalCache: true })
});
