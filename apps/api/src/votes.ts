import { and, count, eq, notExists, sql } from 'drizzle-orm';
import {
  currentTimestamp,
  type Database,
  generatedId,
  inIds,
  selected
} from './db/client.ts';
import { users, votes } from './db/schema.ts';
import { ApiError } from './errors.ts';
import { notNotifiedYet, recordNotification } from './notifications.ts';
import { noBlockBetween } from './visibility.ts';
import { enqueueWebPush, type WebPushMessage } from './web-push.ts';

export type VotableType = 'Pin' | 'Chapter' | 'Comment';

type Votable = { type: VotableType; id: number; userId: number };

export function likesQuery(
  db: Database,
  type: VotableType,
  votableIds: readonly number[],
  voterId?: number
) {
  return db
    .select({
      votableId: sql<number>`${votes.votableId}`.as('votable_id'),
      likes: count().as('likes'),
      liked:
        voterId === undefined
          ? sql<number>`0`.as('liked')
          : sql<number>`coalesce(sum(${votes.voterId} = ${voterId}), 0)`.as(
              'liked'
            )
    })
    .from(votes)
    .where(and(eq(votes.votableType, type), inIds(votes.votableId, votableIds)))
    .groupBy(votes.votableId);
}

export type Likes = { likes: number; liked: boolean };

export function likesByVotable(
  rows: Awaited<ReturnType<typeof likesQuery>>
): (id: number) => Likes {
  const byId = new Map(rows.map((row) => [row.votableId, row]));

  return (id) => {
    const row = byId.get(id);

    return { likes: row?.likes ?? 0, liked: (row?.liked ?? 0) > 0 };
  };
}

function ownVote(votable: Pick<Votable, 'type' | 'id'>, voterId: number) {
  return and(
    eq(votes.votableType, votable.type),
    eq(votes.votableId, votable.id),
    eq(votes.voterType, 'User'),
    eq(votes.voterId, voterId)
  );
}

export async function like(
  db: Database,
  webPush: Queue<WebPushMessage>,
  voterId: number,
  votable: Votable
): Promise<void> {
  const now = currentTimestamp();
  const voter = and(
    eq(users.id, voterId),
    noBlockBetween(db, users.id, votable.userId)
  );
  const notifiable = { type: votable.type, id: votable.id };
  const [notified, , unblocked] = await db.batch([
    recordNotification(db, {
      key: 'liked',
      notifiable,
      notifierId: voterId,
      recipientId: votable.userId,
      now,
      condition: and(
        notNotifiedYet(db, { key: 'liked', notifiable, notifierId: voterId }),
        notExists(
          db
            .select({ id: votes.id })
            .from(votes)
            .where(ownVote(votable, voterId))
        )
      )
    }),
    db
      .insert(votes)
      .select(
        db
          .select({
            id: generatedId(),
            createdAt: selected(now, 'created_at'),
            updatedAt: selected(now, 'updated_at'),
            votableId: selected(votable.id, 'votable_id'),
            votableType: selected(votable.type, 'votable_type'),
            voteFlag: selected(null, 'vote_flag'),
            voteScope: selected(null, 'vote_scope'),
            voteWeight: selected(null, 'vote_weight'),
            voterId: users.id,
            voterType: selected('User', 'voter_type')
          })
          .from(users)
          .where(voter)
      )
      .onConflictDoNothing(),
    db.select({ id: users.id }).from(users).where(voter)
  ]);

  await enqueueWebPush(webPush, notified);

  if (unblocked.length === 0) {
    throw ApiError.invalid(['like_blocked_interaction']);
  }
}

export async function unlike(
  db: Database,
  voterId: number,
  votable: Pick<Votable, 'type' | 'id'>
): Promise<void> {
  const removed = await db
    .delete(votes)
    .where(ownVote(votable, voterId))
    .returning({ id: votes.id });

  if (removed.length === 0) {
    throw new ApiError('NotFound');
  }
}
