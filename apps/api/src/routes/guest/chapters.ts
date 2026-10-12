import type { GuestChapter, GuestChapterDetail } from '@qoodish/api-contract';
import { and, desc, eq, getTableColumns, ne } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../app.ts';
import { chapterSearchResults, guestChapters } from '../../chapters.ts';
import { commentsQuery, guestComment } from '../../comments.ts';
import { FEED_PER_PAGE } from '../../cursor.ts';
import { database } from '../../db/client.ts';
import { chapters, comments } from '../../db/schema.ts';
import { first, present } from '../../routing.ts';
import { SEARCH_LIMIT, searchCondition } from '../../search.ts';
import { id, pathParams } from '../../validation.ts';
import { publicChapter } from '../../visibility.ts';

const app = new Hono<AppEnv>();

app.get('/', async (c) => {
  const db = database(c.env.DB);
  const input = c.req.query('input');

  if (present(input)) {
    const matched = searchCondition(input, {
      index: 'chapters_fts',
      id: chapters.id,
      columns: ['title', 'body']
    });

    if (!matched) {
      return c.json([]);
    }

    return c.json(
      await chapterSearchResults(
        db,
        await db
          .select()
          .from(chapters)
          .where(and(publicChapter(), matched))
          .orderBy(desc(chapters.createdAt), desc(chapters.id))
          .limit(SEARCH_LIMIT)
      )
    );
  }

  return c.json<GuestChapter[]>(
    await guestChapters(
      db,
      await db
        .select()
        .from(chapters)
        .where(publicChapter())
        .orderBy(desc(chapters.createdAt), desc(chapters.id))
        .limit(FEED_PER_PAGE)
    )
  );
});

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const db = database(c.env.DB);
  const { commentsCount, ...chapter } = first(
    await db
      .select({
        ...getTableColumns(chapters),
        commentsCount: db.$count(
          comments,
          and(
            eq(comments.commentableType, 'Chapter'),
            eq(comments.commentableId, chapters.id),
            ne(comments.status, 'deleted')
          )
        )
      })
      .from(chapters)
      .where(and(publicChapter(), eq(chapters.id, c.req.valid('param').id)))
  );

  return c.json<GuestChapterDetail>({
    ...first(await guestChapters(db, [chapter])),
    comments_count: commentsCount
  });
});

app.get(
  '/:chapterId/comments',
  pathParams(z.object({ chapterId: id })),
  async (c) => {
    const db = database(c.env.DB);
    const chapter = first(
      await db
        .select({ id: chapters.id })
        .from(chapters)
        .where(
          and(publicChapter(), eq(chapters.id, c.req.valid('param').chapterId))
        )
    );
    const rows = await commentsQuery(db, 'Chapter', [chapter.id], {
      visibleOnly: false
    });

    return c.json(rows.map(guestComment));
  }
);

export default app;
