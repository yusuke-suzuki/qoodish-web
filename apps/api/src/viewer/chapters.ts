import type { Chapter, ChapterDetail } from '@qoodish/api-contract';
import { and, eq, getTableColumns, ne, type SQL } from 'drizzle-orm';
import type { Database } from '../db/client.ts';
import { chapters, comments } from '../db/schema.ts';
import {
  type ChapterRow,
  chapterAttributes,
  loadChapters
} from '../guest/chapters.ts';
import { chapterAuthor } from '../guest/users.ts';
import { primaryImage } from '../images.ts';
import { shownTo, type Viewer } from '../visibility.ts';
import { relation } from './context.ts';

export async function viewerChapters(
  db: Database,
  viewer: Viewer,
  rows: readonly ChapterRow[]
): Promise<Chapter[]> {
  const parts = await loadChapters(db, rows, viewer.id);

  return parts.map(({ row, author, map, journal, imageUrl, likes }) => ({
    ...chapterAttributes(row),
    ...primaryImage(imageUrl),
    author: { ...chapterAuthor(author), ...relation(viewer, author.id) },
    map,
    journal,
    editable: row.userId === viewer.id,
    liked: likes.liked,
    likes_count: likes.likes,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}

export async function viewerChapterDetails(
  db: Database,
  viewer: Viewer,
  condition: SQL
): Promise<ChapterDetail[]> {
  const rows = await db
    .select({
      ...getTableColumns(chapters),
      commentsCount: db.$count(
        comments,
        and(
          eq(comments.commentableType, 'Chapter'),
          eq(comments.commentableId, chapters.id),
          ne(comments.status, 'deleted'),
          shownTo(viewer, comments.userId)
        )
      )
    })
    .from(chapters)
    .where(condition);
  const counts = new Map(rows.map((row) => [row.id, row.commentsCount]));

  return (await viewerChapters(db, viewer, rows)).map((chapter) => ({
    ...chapter,
    comments_count: counts.get(chapter.id) ?? 0
  }));
}
