import type { GuestComment } from '@qoodish/api-contract';
import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { type Database, inIds } from '../db/client.ts';
import { comments, images, users, votes } from '../db/schema.ts';
import { visible } from '../visibility.ts';
import { userSummary } from './users.ts';

type CommentableType = 'Pin' | 'Chapter';

export function commentsQuery(
  db: Database,
  type: CommentableType,
  commentableIds: readonly number[],
  { visibleOnly }: { visibleOnly: boolean }
) {
  return db
    .select({
      id: comments.id,
      commentableId: comments.commentableId,
      body: comments.body,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userId: sql<number>`${users.id}`.as('author_id'),
      userName: users.name,
      userImageUrl: images.url,
      likesCount: sql<number>`(SELECT count(*) FROM ${votes} WHERE ${and(eq(votes.votableType, 'Comment'), eq(votes.votableId, comments.id))})`
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .leftJoin(images, eq(images.id, users.imageId))
    .where(
      and(
        eq(comments.commentableType, type),
        inIds(comments.commentableId, commentableIds),
        ne(comments.status, 'deleted'),
        visibleOnly ? visible(comments.id, 'Comment') : undefined
      )
    )
    .orderBy(asc(comments.id));
}

export type CommentRow = Awaited<ReturnType<typeof commentsQuery>>[number];

export function guestComment(row: CommentRow): GuestComment {
  return {
    id: row.id,
    author: userSummary({
      id: row.userId,
      name: row.userName,
      biography: null,
      imageUrl: row.userImageUrl
    }),
    body: row.body,
    likes_count: row.likesCount,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  };
}
