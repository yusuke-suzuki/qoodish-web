import type { Comment, GuestComment } from '@qoodish/api-contract';
import { and, asc, eq, exists, max, ne, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  currentTimestamp,
  type Database,
  generatedId,
  inIds,
  reviseUntilCurrent,
  scalar,
  selected,
  unrevisedRecord
} from './db/client.ts';
import {
  commentRevisions,
  comments,
  images,
  users,
  votes
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import { recordNotification } from './notifications.ts';
import { first } from './routing.ts';
import { userSummary } from './users.ts';
import { text } from './validation.ts';
import {
  noBlockBetween,
  notBlockedBy,
  notBlocking,
  type Viewer,
  visible
} from './visibility.ts';

const COMMENT_LIMIT = 500;

type CommentableType = 'Pin' | 'Chapter';

export type CommentsOptions = {
  visibleOnly: boolean;
  condition?: SQL;
  viewerId?: number;
  includeDeleted?: boolean;
};

export function commentsQuery(
  db: Database,
  type: CommentableType,
  commentableIds: readonly number[],
  { visibleOnly, condition, viewerId, includeDeleted = false }: CommentsOptions
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
      likesCount: db
        .$count(
          votes,
          and(
            eq(votes.votableType, 'Comment'),
            eq(votes.votableId, comments.id)
          )
        )
        .as('likes_count'),
      liked: (viewerId === undefined
        ? sql<boolean>`0`
        : sql<boolean>`${exists(
            db
              .select({ id: votes.id })
              .from(votes)
              .where(
                and(
                  eq(votes.votableType, 'Comment'),
                  eq(votes.votableId, comments.id),
                  eq(votes.voterId, viewerId)
                )
              )
          )}`
      )
        .mapWith(Boolean)
        .as('liked')
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .leftJoin(images, eq(images.id, users.imageId))
    .where(
      and(
        eq(comments.commentableType, type),
        inIds(comments.commentableId, commentableIds),
        includeDeleted ? undefined : ne(comments.status, 'deleted'),
        visibleOnly ? visible(comments.id, 'Comment') : undefined,
        condition
      )
    )
    .orderBy(asc(comments.id));
}

export const commentBody = text({
  required: 'comment_required',
  max: { length: COMMENT_LIMIT, error: 'comment_exceeded' }
});

export const commentInput = z.object({ comment: commentBody });

type OwnComment = typeof comments.$inferSelect;

type CommentContent = { body: string; status: 'published' | 'deleted' };

function currentRevisionStatement(db: Database, commentId: number | SQL) {
  return db
    .update(comments)
    .set({
      currentRevisionId: scalar(
        db
          .select({ id: max(commentRevisions.id).as('id') })
          .from(commentRevisions)
          .where(eq(commentRevisions.commentId, commentId))
      )
    })
    .where(eq(comments.id, commentId));
}

export async function recordComment(
  db: Database,
  viewerId: number,
  {
    type,
    commentable,
    body
  }: {
    type: CommentableType;
    commentable: { id: number; userId: number };
    body: string;
  }
): Promise<number> {
  const content: CommentContent = { body, status: 'published' };
  const now = currentTimestamp();
  const unblockedAuthor = and(
    eq(users.id, commentable.userId),
    noBlockBetween(db, users.id, viewerId)
  );
  const commentId = scalar(
    db
      .select({ id: max(comments.id).as('id') })
      .from(comments)
      .where(
        and(
          eq(comments.userId, viewerId),
          exists(db.select({ id: users.id }).from(users).where(unblockedAuthor))
        )
      )
  );
  const [, , , , recorded] = await db.batch([
    db.insert(comments).select(
      db
        .select({
          id: generatedId(),
          body: selected(content.body, 'body'),
          commentableId: selected(commentable.id, 'commentable_id'),
          commentableType: selected(type, 'commentable_type'),
          createdAt: selected(now, 'created_at'),
          currentRevisionId: selected(null, 'current_revision_id'),
          status: selected(content.status, 'status'),
          updatedAt: selected(now, 'updated_at'),
          userId: selected(viewerId, 'user_id')
        })
        .from(users)
        .where(unblockedAuthor)
    ),
    db.insert(commentRevisions).select(
      db
        .select({
          id: generatedId(),
          body: selected(content.body, 'body'),
          commentId: comments.id,
          createdAt: selected(now, 'created_at'),
          status: selected(content.status, 'status'),
          updatedAt: selected(now, 'updated_at'),
          userId: selected(viewerId, 'user_id')
        })
        .from(comments)
        .where(eq(comments.id, commentId))
    ),
    currentRevisionStatement(db, commentId),
    recordNotification(db, {
      key: 'comment',
      notifiable: { type, id: commentable.id },
      notifierId: viewerId,
      recipientId: commentable.userId,
      now
    }),
    db
      .select({ id: comments.id })
      .from(comments)
      .where(eq(comments.id, commentId))
  ]);
  const [comment] = recorded;

  if (!comment) {
    throw ApiError.invalid(['comment_blocked_interaction']);
  }

  return comment.id;
}

export async function ownComment(
  db: Database,
  userId: number,
  {
    type,
    commentableId,
    commentId
  }: { type: CommentableType; commentableId: number; commentId: number }
): Promise<OwnComment> {
  return first(
    await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.userId, userId),
          ne(comments.status, 'deleted'),
          eq(comments.commentableType, type),
          eq(comments.commentableId, commentableId),
          eq(comments.id, commentId)
        )
      )
  );
}

async function writeCommentRevision(
  db: Database,
  comment: OwnComment,
  { editorId, content }: { editorId: number; content: CommentContent }
): Promise<void> {
  if (content.body === comment.body && content.status === comment.status) {
    return;
  }

  const now = currentTimestamp();
  const commentId = unrevisedRecord(db, comments, comment);

  await db.batch([
    db
      .update(comments)
      .set({ ...content, updatedAt: now })
      .where(eq(comments.id, comment.id)),
    db.insert(commentRevisions).values({
      ...content,
      commentId,
      userId: editorId,
      createdAt: now,
      updatedAt: now
    }),
    currentRevisionStatement(db, commentId)
  ]);
}

function currentCommentContent(comment: OwnComment): CommentContent {
  return {
    body: comment.body,
    status: comment.status === 'deleted' ? 'deleted' : 'published'
  };
}

export function reviseComment(
  db: Database,
  read: () => Promise<OwnComment>,
  { editorId, body }: { editorId: number; body: string }
): Promise<void> {
  return reviseUntilCurrent(commentRevisions.commentId, async () => {
    const comment = await read();

    await writeCommentRevision(db, comment, {
      editorId,
      content: { ...currentCommentContent(comment), body }
    });
  });
}

export function discardComment(
  db: Database,
  read: () => Promise<OwnComment>,
  editorId: number
): Promise<void> {
  return reviseUntilCurrent(commentRevisions.commentId, async () => {
    const comment = await read();

    await writeCommentRevision(db, comment, {
      editorId,
      content: { ...currentCommentContent(comment), status: 'deleted' }
    });
  });
}

export type CommentRow = Awaited<ReturnType<typeof commentsQuery>>[number];

export async function interactableComment(
  db: Database,
  viewer: Viewer,
  {
    type,
    commentableId,
    commentId
  }: { type: CommentableType; commentableId: number; commentId: number }
): Promise<{ id: number; userId: number }> {
  return first(
    await db
      .select({ id: comments.id, userId: comments.userId })
      .from(comments)
      .where(
        and(
          eq(comments.commentableType, type),
          eq(comments.commentableId, commentableId),
          eq(comments.id, commentId),
          ne(comments.status, 'deleted'),
          type === 'Pin' ? visible(comments.id, 'Comment') : undefined,
          notBlocking(viewer, comments.userId),
          notBlockedBy(viewer, comments.userId)
        )
      )
  );
}

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

export function viewerComment(row: CommentRow): Comment {
  const { likes_count, created_at, updated_at, ...comment } = guestComment(row);

  return {
    ...comment,
    liked: row.liked,
    likes_count,
    created_at,
    updated_at
  };
}
