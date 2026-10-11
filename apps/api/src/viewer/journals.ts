import type { Journal } from '@qoodish/api-contract';
import { and, asc, desc, eq, getTableColumns, type SQL } from 'drizzle-orm';
import type { Database } from '../db/client.ts';
import {
  chapters,
  images,
  journalBookmarks,
  journals,
  users
} from '../db/schema.ts';
import { userSummary } from '../guest/users.ts';
import type { Viewer } from './context.ts';

export async function viewerJournals(
  db: Database,
  viewer: Viewer,
  condition: SQL
): Promise<Journal[]> {
  const rows = await db
    .select({
      ...getTableColumns(journals),
      authorName: users.name,
      authorImageUrl: images.url,
      chaptersCount: db.$count(
        chapters,
        and(
          eq(chapters.userId, journals.userId),
          eq(chapters.status, 'published')
        )
      ),
      bookmarks: db.$count(
        journalBookmarks,
        and(
          eq(journalBookmarks.journalId, journals.id),
          eq(journalBookmarks.userId, viewer.id)
        )
      )
    })
    .from(journals)
    .innerJoin(users, eq(users.id, journals.userId))
    .leftJoin(images, eq(images.id, users.imageId))
    .where(condition)
    .orderBy(desc(journals.createdAt), asc(journals.id));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    author: userSummary({
      id: row.userId,
      name: row.authorName,
      biography: null,
      imageUrl: row.authorImageUrl
    }),
    chapters_count: row.chaptersCount,
    editable: row.userId === viewer.id,
    bookmarking: row.bookmarks > 0,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}
