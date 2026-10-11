import type { Chapter } from '@qoodish/api-contract';
import type { Database } from '../db/client.ts';
import {
  type ChapterRow,
  chapterAttributes,
  loadChapters
} from '../guest/chapters.ts';
import { chapterAuthor } from '../guest/users.ts';
import { primaryImage } from '../images.ts';
import type { Viewer } from '../visibility.ts';
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
