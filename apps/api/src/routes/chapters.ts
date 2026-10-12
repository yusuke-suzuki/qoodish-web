import type {
  Chapter,
  ChapterComment,
  ChapterDetail
} from '@qoodish/api-contract';
import { and, desc, eq, lt, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { viewerChapterDetails, viewerChapters } from '../chapters.ts';
import { commentsQuery, viewerComment } from '../comments.ts';
import { before, FEED_PER_PAGE, normalizeTimestamp } from '../cursor.ts';
import { type Database, database } from '../db/client.ts';
import { chapters, comments } from '../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first } from '../routing.ts';
import { id, optionalId, pathParams } from '../validation.ts';
import {
  feedChapter,
  readableChapter,
  shownTo,
  type Viewer
} from '../visibility.ts';

const chapterParams = pathParams(z.object({ chapterId: id }));

function chapterFeedBefore(
  nextTimestamp: string,
  nextId: string | undefined
): SQL | undefined {
  const createdAt = normalizeTimestamp(nextTimestamp);
  const cursorId = optionalId(nextId);

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
  condition: SQL | undefined
): Promise<ChapterComment[]> {
  const rows = await commentsQuery(db, 'Chapter', [chapterId], {
    visibleOnly: false,
    condition,
    viewerId: viewer.id
  });

  return rows.map((row) => ({
    ...viewerComment(row),
    editable: row.userId === viewer.id
  }));
}

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const { next_timestamp: nextTimestamp, next_id: nextId } = c.req.query();
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
        database(c.env.DB),
        viewer,
        and(readableChapter(viewer), eq(chapters.id, c.req.valid('param').id))
      )
    )
  );
});

app.get('/:chapterId/comments', chapterParams, async (c) => {
  const db = database(c.env.DB);
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

export default app;
