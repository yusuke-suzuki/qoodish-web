import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readBodyWithinLimit } from './readBodyWithinLimit.ts';

function streamedRequest(body: string) {
  return new Request('https://example.com', {
    method: 'POST',
    body: new Blob([body]).stream(),
    duplex: 'half'
  } as RequestInit);
}

describe('readBodyWithinLimit', () => {
  it('returns a body within the limit', async () => {
    assert.equal(await readBodyWithinLimit(streamedRequest('abc'), 3), 'abc');
  });

  it('counts the limit in bytes rather than characters', async () => {
    const threeBytes = String.fromCodePoint(0x3042);

    assert.equal(
      await readBodyWithinLimit(streamedRequest(threeBytes), 2),
      null
    );
    assert.equal(
      await readBodyWithinLimit(streamedRequest(threeBytes), 3),
      threeBytes
    );
  });

  it('rejects a declared length over the limit without reading', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Length': '4' },
      body: 'abcd'
    });

    assert.equal(await readBodyWithinLimit(request, 3), null);
    assert.equal(request.bodyUsed, false);
  });

  it('returns an empty string for a request without a body', async () => {
    assert.equal(
      await readBodyWithinLimit(new Request('https://example.com'), 3),
      ''
    );
  });
});
