import { createMessageBatch, env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import worker from './index.ts';

describe('queue', () => {
  it('refuses a batch from a queue it does not consume', async () => {
    const batch = createMessageBatch('dev-qoodish-api-unknown', []);

    await expect(worker.queue(batch, env)).rejects.toThrow(
      'No consumer for the queue dev-qoodish-api-unknown'
    );
  });
});
