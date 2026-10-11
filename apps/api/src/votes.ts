import { and, count, eq, sql } from 'drizzle-orm';
import { type Database, inIds } from './db/client.ts';
import { votes } from './db/schema.ts';

export type VotableType = 'Pin' | 'Chapter' | 'Comment';

export function likesQuery(
  db: Database,
  type: VotableType,
  votableIds: readonly number[],
  voterId?: number
) {
  return db
    .select({
      votableId: sql<number>`${votes.votableId}`,
      likes: count(),
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
