import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { ApiError } from '../errors.ts';
import { ids, seedWorld } from '../test/world.ts';
import {
  constraintViolated,
  database,
  reviseUntilCurrent,
  unrevisedRecord
} from './client.ts';
import {
  journalBookmarks,
  journalRevisions,
  journals,
  users
} from './schema.ts';

const JOURNAL = 1;

beforeAll(async () => {
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

function recordRevisionSince(revisionId: number | null) {
  const now = new Date().toISOString();

  return db()
    .insert(journalRevisions)
    .values({
      journalId: unrevisedRecord(db(), journals, {
        id: JOURNAL,
        currentRevisionId: revisionId
      }),
      userId: ids.alice,
      title: 'Revised',
      createdAt: now,
      updatedAt: now
    });
}

async function failureOf(write: () => Promise<unknown>): Promise<unknown> {
  try {
    await write();
  } catch (error) {
    return error;
  }

  throw new Error('expected the write to fail');
}

describe('unrevisedRecord', () => {
  it('lets a revision through while the row is still at the revision that was read', async () => {
    await expect(recordRevisionSince(null)).resolves.toBeDefined();
  });

  it('refuses a revision once the row has moved on', async () => {
    const error = await failureOf(() => recordRevisionSince(12345));

    expect(
      constraintViolated(error, 'NOT NULL', journalRevisions.journalId)
    ).toBe(true);
    expect(constraintViolated(error, 'NOT NULL', users.uid)).toBe(false);
    expect(
      constraintViolated(error, 'UNIQUE', journalRevisions.journalId)
    ).toBe(false);
  });
});

describe('constraintViolated', () => {
  it('names every column of a composite unique index', async () => {
    const now = new Date().toISOString();
    const bookmark = () =>
      db().insert(journalBookmarks).values({
        journalId: JOURNAL,
        userId: ids.bob,
        createdAt: now,
        updatedAt: now
      });

    await bookmark();
    const error = await failureOf(bookmark);

    expect(
      constraintViolated(
        error,
        'UNIQUE',
        journalBookmarks.journalId,
        journalBookmarks.userId
      )
    ).toBe(true);
    expect(
      constraintViolated(error, 'UNIQUE', journalBookmarks.journalId)
    ).toBe(false);
    expect(constraintViolated(error, 'UNIQUE', journalBookmarks.userId)).toBe(
      false
    );
  });
});

describe('reviseUntilCurrent', () => {
  it('reads again and retries when the revision was refused', async () => {
    const attempts: number[] = [];

    const result = await reviseUntilCurrent(
      journalRevisions.journalId,
      async () => {
        attempts.push(attempts.length);

        if (attempts.length === 1) {
          await recordRevisionSince(12345);
        }

        return 'revised';
      }
    );

    expect(result).toBe('revised');
    expect(attempts).toHaveLength(2);
  });

  it('answers 409 when every attempt is refused', async () => {
    let attempts = 0;
    const error = await failureOf(() =>
      reviseUntilCurrent(journalRevisions.journalId, async () => {
        attempts++;
        await recordRevisionSince(12345);
      })
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect(attempts).toBe(3);
  });

  it('rethrows any other failure without retrying', async () => {
    let attempts = 0;
    const failure = new Error('unrelated');
    const error = await failureOf(() =>
      reviseUntilCurrent(journalRevisions.journalId, async () => {
        attempts++;
        throw failure;
      })
    );

    expect(error).toBe(failure);
    expect(attempts).toBe(1);
  });
});
