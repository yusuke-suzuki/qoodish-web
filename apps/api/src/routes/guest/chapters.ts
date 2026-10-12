import type {
  GuestChapter,
  GuestChapterDetail,
  GuestComment
} from '@qoodish/api-contract';
import { and, desc, eq, getTableColumns, ne } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../app.ts';
import {
  type ChapterSearchResult,
  chapterSearchResults,
  guestChapters
} from '../../chapters.ts';
import { commentsQuery, guestComment } from '../../comments.ts';
import { FEED_PER_PAGE } from '../../cursor.ts';
import { chapters, comments } from '../../db/schema.ts';
import { first } from '../../routing.ts';
import { SEARCH_LIMIT, searchCondition } from '../../search.ts';
import { id, pathParams, queryParams, searchInput } from '../../validation.ts';
import { publicChapter } from '../../visibility.ts';

const app = new Hono<AppEnv>();

app.get('/', queryParams(z.object({ input: searchInput })), async (c) => {
  const db = c.get('db');
  const { input } = c.req.valid('query');

  if (input !== undefined) {
    const matched = searchCondition(input, {
      index: 'chapters_fts',
      id: chapters.id,
      columns: ['title', 'body']
    });

    if (!matched) {
      return c.json<ChapterSearchResult[]>([]);
    }

    return c.json<ChapterSearchResult[]>(
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
  const db = c.get('db');
  const { commentsCount, ...chapter } = first(
    await db
      .select({
        ...getTableColumns(chapters),
        commentsCount: db
          .$count(
            comments,
            and(
              eq(comments.commentableType, 'Chapter'),
              eq(comments.commentableId, chapters.id),
              ne(comments.status, 'deleted')
            )
          )
          .as('comments_count')
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
    const db = c.get('db');
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

    return c.json<GuestComment[]>(rows.map(guestComment));
  }
);

export default app;
