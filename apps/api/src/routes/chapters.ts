import type {
  Chapter,
  ChapterComment,
  ChapterDetail
} from '@qoodish/api-contract';
import { and, desc, eq, lt, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { viewerChapterDetails, viewerChapters } from '../chapters.ts';
import { commentsQuery, viewerComment } from '../comments.ts';
import { before, FEED_PER_PAGE, normalizeTimestamp } from '../cursor.ts';
import { database } from '../db/client.ts';
import { chapters, comments } from '../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { first, present, toId } from '../routing.ts';
import { feedChapter, readableChapter, shownTo } from '../visibility.ts';

function chapterFeedBefore(
  nextTimestamp: string,
  nextId: string | undefined
): SQL {
  const createdAt = normalizeTimestamp(nextTimestamp);

  if (!present(nextId)) {
    return lt(chapters.createdAt, createdAt);
  }

  return before(
    { createdAt, id: toId(nextId) },
    chapters.createdAt,
    chapters.id
  );
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

app.get('/:id', async (c) => {
  const viewer = c.get('viewer');

  return c.json<ChapterDetail>(
    first(
      await viewerChapterDetails(
        database(c.env.DB),
        viewer,
        and(
          readableChapter(viewer),
          eq(chapters.id, toId(c.req.param('id')))
        ) as SQL
      )
    )
  );
});

app.get('/:chapterId/comments', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const chapter = first(
    await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(
        and(
          readableChapter(viewer),
          eq(chapters.id, toId(c.req.param('chapterId')))
        )
      )
  );
  const rows = await commentsQuery(db, 'Chapter', [chapter.id], {
    visibleOnly: false,
    condition: shownTo(viewer, comments.userId),
    viewerId: viewer.id
  });

  return c.json<ChapterComment[]>(
    rows.map((row) => ({
      ...viewerComment(row),
      editable: row.userId === viewer.id
    }))
  );
});

export default app;
