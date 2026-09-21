import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import pageAll, { type Cursor } from './pageAll.ts';

type Row = Cursor;

function row(id: number): Row {
  return { id, created_at: `2026-01-01T00:00:0${id % 10}Z` };
}

function pagedSource(rows: Row[], size: number) {
  const calls: (Cursor | undefined)[] = [];

  const fetchPage = async (cursor?: Cursor) => {
    calls.push(cursor);
    const from = cursor ? rows.findIndex((r) => r.id === cursor.id) + 1 : 0;
    return rows.slice(from, from + size);
  };

  return { calls, fetchPage };
}

const LIMITS = { maxRequests: 10 };

describe('pageAll', () => {
  it('walks every page until the source runs out', async () => {
    const rows = Array.from({ length: 7 }, (_, index) => row(index + 1));
    const { calls, fetchPage } = pagedSource(rows, 3);

    assert.deepEqual(await pageAll(fetchPage, LIMITS), rows);
    assert.deepEqual(calls, [
      undefined,
      { id: 3, created_at: rows[2].created_at },
      { id: 6, created_at: rows[5].created_at },
      { id: 7, created_at: rows[6].created_at }
    ]);
  });

  it('returns an empty list when the first page is empty', async () => {
    const { fetchPage } = pagedSource([], 3);

    assert.deepEqual(await pageAll(fetchPage, LIMITS), []);
  });

  it('gives up on a source that ignores the cursor', async () => {
    let requests = 0;

    const collected = await pageAll(async () => {
      requests++;
      return [row(1), row(2)];
    }, LIMITS);

    assert.equal(requests, 2);
    assert.deepEqual(collected, [row(1), row(2)]);
  });

  // The budget is the only ceiling, so what it yields is however many rows
  // those requests carried, not a round number of entries.
  it('spends no more requests than its budget', async () => {
    const rows = Array.from({ length: 100 }, (_, index) => row(index + 1));
    const { calls, fetchPage } = pagedSource(rows, 12);

    const collected = await pageAll(fetchPage, { maxRequests: 3 });

    assert.equal(calls.length, 3);
    assert.equal(collected.length, 36);
  });
});
