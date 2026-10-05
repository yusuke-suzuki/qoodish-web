import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CursorPage } from '../../types/index.ts';
import pageAll from './pageAll.ts';

type Row = { id: number };

function rows(length: number): Row[] {
  return Array.from({ length }, (_, index) => ({ id: index + 1 }));
}

function pagedSource(source: Row[], size: number) {
  const calls: (string | undefined)[] = [];

  const fetchPage = async (cursor?: string): Promise<CursorPage<Row>> => {
    calls.push(cursor);
    const from = cursor ? Number(cursor) : 0;
    const to = from + size;
    return {
      items: source.slice(from, to),
      nextCursor: to < source.length ? String(to) : null
    };
  };

  return { calls, fetchPage };
}

const LIMITS = { maxRequests: 10 };

describe('pageAll', () => {
  it('follows the cursor until the source hands out none', async () => {
    const source = rows(7);
    const { calls, fetchPage } = pagedSource(source, 3);

    assert.deepEqual(await pageAll(fetchPage, LIMITS), source);
    assert.deepEqual(calls, [undefined, '3', '6']);
  });

  it('returns an empty list when the first page is empty', async () => {
    const { fetchPage } = pagedSource([], 3);

    assert.deepEqual(await pageAll(fetchPage, LIMITS), []);
  });

  it('gives up on a source that hands back the cursor it was given', async () => {
    let requests = 0;

    const collected = await pageAll(async () => {
      requests++;
      return { items: rows(2), nextCursor: 'same' };
    }, LIMITS);

    assert.equal(requests, 2);
    assert.deepEqual(collected, [...rows(2), ...rows(2)]);
  });

  it('spends no more requests than its budget', async () => {
    const { calls, fetchPage } = pagedSource(rows(100), 12);

    const collected = await pageAll(fetchPage, { maxRequests: 3 });

    assert.equal(calls.length, 3);
    assert.equal(collected.length, 36);
  });
});
