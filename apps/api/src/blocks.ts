import { and, eq, notExists } from 'drizzle-orm';
import { removeBookmarksBetween } from './bookmarks.ts';
import { declineInvitationsBetween } from './coauthorship-invitations.ts';
import {
  currentTimestamp,
  type Database,
  generatedId,
  selected
} from './db/client.ts';
import { blocks, unblocks, users } from './db/schema.ts';
import { ApiError } from './errors.ts';
import { removeCoauthorshipsBetween } from './maps.ts';
import { activeBlock } from './visibility.ts';

export async function blockUser(
  db: Database,
  { blockerId, blockedId }: { blockerId: number; blockedId: number }
): Promise<void> {
  if (blockerId === blockedId) {
    throw ApiError.invalid(['block_self']);
  }

  const now = currentTimestamp();
  const pair = [blockerId, blockedId] as const;

  await db.batch([
    db.insert(blocks).select(
      db
        .select({
          id: generatedId(),
          blockedId: users.id,
          blockerId: selected(blockerId, 'blocker_id'),
          createdAt: selected(now, 'created_at')
        })
        .from(users)
        .where(
          and(
            eq(users.id, blockedId),
            notExists(
              db
                .select({ id: blocks.id })
                .from(blocks)
                .where(
                  and(
                    eq(blocks.blockerId, blockerId),
                    eq(blocks.blockedId, blockedId),
                    activeBlock(db)
                  )
                )
            )
          )
        )
    ),
    ...removeBookmarksBetween(db, pair),
    removeCoauthorshipsBetween(db, pair),
    declineInvitationsBetween(db, pair, now)
  ]);
}

export async function unblockUser(
  db: Database,
  { blockerId, blockedId }: { blockerId: number; blockedId: number }
): Promise<void> {
  await db
    .insert(unblocks)
    .select(
      db
        .select({
          id: generatedId(),
          blockId: blocks.id,
          createdAt: selected(currentTimestamp(), 'created_at')
        })
        .from(blocks)
        .where(
          and(
            eq(blocks.blockerId, blockerId),
            eq(blocks.blockedId, blockedId),
            activeBlock(db)
          )
        )
    )
    .onConflictDoNothing();
}
