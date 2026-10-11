import type { ViewerRelation } from '@qoodish/api-contract';
import { and, eq, notExists } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../app.ts';
import { type Database, database } from '../db/client.ts';
import { blocks, mutes, unblocks, unmutes, users } from '../db/schema.ts';
import { ApiError } from '../errors.ts';
import type { Viewer } from '../visibility.ts';

export type ViewerEnv = {
  Bindings: AppEnv['Bindings'];
  Variables: AppEnv['Variables'] & { viewer: Viewer };
};

const activeBlock = (db: Database) =>
  notExists(
    db
      .select({ id: unblocks.id })
      .from(unblocks)
      .where(eq(unblocks.blockId, blocks.id))
  );

const activeMute = (db: Database) =>
  notExists(
    db
      .select({ id: unmutes.id })
      .from(unmutes)
      .where(eq(unmutes.muteId, mutes.id))
  );

export async function loadViewer(
  db: Database,
  uid: string
): Promise<Viewer | null> {
  const [[user], blocked, blockers, muted] = await db.batch([
    db.select({ id: users.id }).from(users).where(eq(users.uid, uid)),
    db
      .select({ id: blocks.blockedId })
      .from(blocks)
      .innerJoin(users, eq(users.id, blocks.blockerId))
      .where(and(eq(users.uid, uid), activeBlock(db))),
    db
      .select({ id: blocks.blockerId })
      .from(blocks)
      .innerJoin(users, eq(users.id, blocks.blockedId))
      .where(and(eq(users.uid, uid), activeBlock(db))),
    db
      .select({ id: mutes.mutedId })
      .from(mutes)
      .innerJoin(users, eq(users.id, mutes.muterId))
      .where(and(eq(users.uid, uid), activeMute(db)))
  ]);

  if (!user) {
    return null;
  }

  const ids = (rows: readonly { id: number }[]) =>
    new Set(rows.map((row) => row.id));

  return {
    id: user.id,
    blocking: ids(blocked),
    blockedBy: ids(blockers),
    muting: ids(muted)
  };
}

export const authenticateUser = createMiddleware<ViewerEnv>(async (c, next) => {
  const viewer = await loadViewer(database(c.env.DB), c.get('idToken').sub);

  if (!viewer) {
    throw new ApiError('Unauthorized');
  }

  c.set('viewer', viewer);
  await next();
});

export function relation(viewer: Viewer, userId: number): ViewerRelation {
  return {
    blocking: viewer.blocking.has(userId),
    muting: viewer.muting.has(userId)
  };
}
