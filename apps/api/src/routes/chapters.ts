import type {
  Chapter,
  ChapterComment,
  ChapterDetail
} from '@qoodish/api-contract';
import { and, desc, eq, lt, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { viewerChapterDetails, viewerChapters } from '../chapters.ts';
import {
  commentInput,
  commentsQuery,
  discardComment,
  interactableComment,
  ownComment,
  recordComment,
  reviseComment,
  viewerComment
} from '../comments.ts';
import { before, FEED_PER_PAGE, normalizeTimestamp } from '../cursor.ts';
import type { Database } from '../db/client.ts';
import { chapters, comments } from '../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first } from '../routing.ts';
import {
  decoded,
  id,
  jsonBody,
  optionalId,
  pathParams,
  queryParams
} from '../validation.ts';
import {
  feedChapter,
  readableChapter,
  referenceableChapter,
  shownTo,
  type Viewer
} from '../visibility.ts';
import { like, unlike } from '../votes.ts';

const chapterParams = pathParams(z.object({ chapterId: id }));
const ownCommentParams = pathParams(z.object({ chapterId: id, id }));
const commentParams = pathParams(z.object({ chapterId: id, commentId: id }));

const feedQuery = queryParams(
  z.object({
    next_timestamp: decoded(normalizeTimestamp).optional(),
    next_id: z.string().optional().transform(optionalId)
  })
);

function chapterFeedBefore(
  createdAt: string,
  cursorId: number | undefined
): SQL | undefined {
  if (cursorId === undefined) {
    return lt(chapters.createdAt, createdAt);
  }

  return before({ createdAt, id: cursorId }, chapters.createdAt, chapters.id);
}

async function chapterOf(
  db: Database,
  condition: SQL | undefined,
  chapterId: number
) {
  return first(
    await db
      .select({ id: chapters.id, userId: chapters.userId })
      .from(chapters)
      .where(and(condition, eq(chapters.id, chapterId)))
  );
}

async function chapterComments(
  db: Database,
  viewer: Viewer,
  chapterId: number,
  condition: SQL | undefined,
  includeDeleted = false
): Promise<ChapterComment[]> {
  const rows = await commentsQuery(db, 'Chapter', [chapterId], {
    visibleOnly: false,
    condition,
    viewerId: viewer.id,
    includeDeleted
  });

  return rows.map((row) => ({
    ...viewerComment(row),
    editable: row.userId === viewer.id
  }));
}

async function writtenComment(
  db: Database,
  viewer: Viewer,
  { chapterId, commentId }: { chapterId: number; commentId: number }
): Promise<ChapterComment> {
  return first(
    await chapterComments(
      db,
      viewer,
      chapterId,
      eq(comments.id, commentId),
      true
    )
  );
}

async function ownChapterComment(
  db: Database,
  viewer: Viewer,
  params: { chapterId: number; id: number }
) {
  const chapter = await chapterOf(
    db,
    readableChapter(viewer),
    params.chapterId
  );

  return {
    chapterId: chapter.id,
    read: () =>
      ownComment(db, viewer.id, {
        type: 'Chapter',
        commentableId: chapter.id,
        commentId: params.id
      })
  };
}

async function chapterComment(
  db: Database,
  viewer: Viewer,
  params: { chapterId: number; commentId: number }
) {
  const chapter = await chapterOf(
    db,
    readableChapter(viewer),
    params.chapterId
  );
  const comment = await interactableComment(db, viewer, {
    type: 'Chapter',
    commentableId: chapter.id,
    commentId: params.commentId
  });

  return { chapter, comment };
}

async function likedChapter(db: Database, viewer: Viewer, chapterId: number) {
  return first(
    await viewerChapterDetails(db, viewer, eq(chapters.id, chapterId))
  );
}

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/', feedQuery, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const { next_timestamp: nextTimestamp, next_id: nextId } =
    c.req.valid('query');
  const rows = await db
    .select()
    .from(chapters)
    .where(
      and(
        feedChapter(viewer),
        nextTimestamp === undefined
          ? undefined
          : chapterFeedBefore(nextTimestamp, nextId)
      )
    )
    .orderBy(desc(chapters.createdAt), desc(chapters.id))
    .limit(FEED_PER_PAGE);

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const viewer = c.get('viewer');

  return c.json<ChapterDetail>(
    first(
      await viewerChapterDetails(
        c.get('db'),
        viewer,
        and(readableChapter(viewer), eq(chapters.id, c.req.valid('param').id))
      )
    )
  );
});

app.get('/:chapterId/comments', chapterParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const chapter = await chapterOf(
    db,
    readableChapter(viewer),
    c.req.valid('param').chapterId
  );

  return c.json<ChapterComment[]>(
    await chapterComments(
      db,
      viewer,
      chapter.id,
      shownTo(viewer, comments.userId)
    )
  );
});

app.post(
  '/:chapterId/comments',
  chapterParams,
  jsonBody(commentInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const chapter = await chapterOf(
      db,
      readableChapter(viewer),
      c.req.valid('param').chapterId
    );
    const commentId = await recordComment(db, viewer.id, {
      type: 'Chapter',
      commentable: chapter,
      body: c.req.valid('json').comment
    });

    return c.json<ChapterComment>(
      await writtenComment(db, viewer, { chapterId: chapter.id, commentId })
    );
  }
);

app.on(
  ['PUT', 'PATCH'],
  '/:chapterId/comments/:id',
  ownCommentParams,
  jsonBody(commentInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const params = c.req.valid('param');
    const { chapterId, read } = await ownChapterComment(db, viewer, params);

    await reviseComment(db, read, {
      editorId: viewer.id,
      body: c.req.valid('json').comment
    });

    return c.json<ChapterComment>(
      await writtenComment(db, viewer, { chapterId, commentId: params.id })
    );
  }
);

app.delete('/:chapterId/comments/:id', ownCommentParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const params = c.req.valid('param');
  const { chapterId, read } = await ownChapterComment(db, viewer, params);

  await discardComment(db, read, viewer.id);

  return c.json<ChapterComment>(
    await writtenComment(db, viewer, { chapterId, commentId: params.id })
  );
});

app.post('/:chapterId/like', chapterParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const chapter = await chapterOf(
    db,
    referenceableChapter(viewer),
    c.req.valid('param').chapterId
  );

  await like(db, viewer.id, {
    type: 'Chapter',
    id: chapter.id,
    userId: chapter.userId
  });

  return c.json<ChapterDetail>(await likedChapter(db, viewer, chapter.id));
});

app.delete('/:chapterId/like', chapterParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const chapter = await chapterOf(
    db,
    referenceableChapter(viewer),
    c.req.valid('param').chapterId
  );

  await unlike(db, viewer.id, { type: 'Chapter', id: chapter.id });

  return c.json<ChapterDetail>(await likedChapter(db, viewer, chapter.id));
});

app.post('/:chapterId/comments/:commentId/like', commentParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const { chapter, comment } = await chapterComment(
    db,
    viewer,
    c.req.valid('param')
  );

  await like(db, viewer.id, {
    type: 'Comment',
    id: comment.id,
    userId: comment.userId
  });

  return c.json<ChapterComment>(
    first(
      await chapterComments(db, viewer, chapter.id, eq(comments.id, comment.id))
    )
  );
});

app.delete('/:chapterId/comments/:commentId/like', commentParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const { chapter, comment } = await chapterComment(
    db,
    viewer,
    c.req.valid('param')
  );

  await unlike(db, viewer.id, { type: 'Comment', id: comment.id });

  return c.json<ChapterComment>(
    first(
      await chapterComments(db, viewer, chapter.id, eq(comments.id, comment.id))
    )
  );
});

export default app;
