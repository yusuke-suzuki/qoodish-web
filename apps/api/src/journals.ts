import type { Journal } from '@qoodish/api-contract';
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  max,
  type SQL
} from 'drizzle-orm';
import { currentTimestamp, type Database, scalar } from './db/client.ts';
import {
  chapters,
  images,
  journalBookmarks,
  journalRevisions,
  journals,
  users
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import { first } from './routing.ts';
import { characters, truncate } from './text.ts';
import { userColumns, userSummary } from './users.ts';
import type { Viewer } from './visibility.ts';

const JOURNAL_TITLE_LIMIT = 50;
const JOURNAL_DESCRIPTION_LIMIT = 200;

type JournalContent = { title: string; description: string | null };

function journalErrors({ title, description }: JournalContent): MessageKey[] {
  const errors: MessageKey[] = [];

  if (title.trim() === '') {
    errors.push('journal_title_required');
  } else if (characters(title) > JOURNAL_TITLE_LIMIT) {
    errors.push('journal_title_exceed');
  }

  if (description && characters(description) > JOURNAL_DESCRIPTION_LIMIT) {
    errors.push('journal_description_exceed');
  }

  return errors;
}

function journalRevisionStatements(
  db: Database,
  {
    journalId,
    userId,
    content,
    now
  }: {
    journalId: number | SQL;
    userId: number | SQL;
    content: JournalContent;
    now: string;
  }
) {
  return [
    db.insert(journalRevisions).values({
      ...content,
      journalId,
      userId,
      createdAt: now,
      updatedAt: now
    }),
    db
      .update(journals)
      .set({
        currentRevisionId: scalar(
          db
            .select({ id: max(journalRevisions.id) })
            .from(journalRevisions)
            .where(eq(journalRevisions.journalId, journalId))
        )
      })
      .where(eq(journals.id, journalId))
  ] as const;
}

export function recordDefaultJournal(
  db: Database,
  { userId, ownerName, now }: { userId: SQL; ownerName: string; now: string }
) {
  const content = {
    title: truncate(`${ownerName}'s journal`, JOURNAL_TITLE_LIMIT),
    description: null
  };

  return [
    db
      .insert(journals)
      .values({ ...content, userId, createdAt: now, updatedAt: now }),
    ...journalRevisionStatements(db, {
      journalId: scalar(
        db
          .select({ id: journals.id })
          .from(journals)
          .where(eq(journals.userId, userId))
      ),
      userId,
      content,
      now
    })
  ] as const;
}

export async function reviseJournal(
  db: Database,
  userId: number,
  changes: Partial<JournalContent>
): Promise<void> {
  const journal = first(
    await db
      .select({
        id: journals.id,
        title: journals.title,
        description: journals.description
      })
      .from(journals)
      .where(eq(journals.userId, userId))
  );
  const content: JournalContent = {
    title: changes.title ?? journal.title,
    description:
      changes.description === undefined
        ? journal.description
        : changes.description
  };
  const errors = journalErrors(content);

  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }

  if (
    content.title === journal.title &&
    content.description === journal.description
  ) {
    return;
  }

  const now = currentTimestamp();

  await db.batch([
    db
      .update(journals)
      .set({ ...content, updatedAt: now })
      .where(eq(journals.id, journal.id)),
    ...journalRevisionStatements(db, {
      journalId: journal.id,
      userId,
      content,
      now
    })
  ]);
}

export async function viewerJournals(
  db: Database,
  viewer: Viewer,
  condition: SQL
): Promise<Journal[]> {
  const rows = await db
    .select({
      ...getTableColumns(journals),
      author: userColumns,
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
    author: userSummary(row.author),
    chapters_count: row.chaptersCount,
    editable: row.userId === viewer.id,
    bookmarking: row.bookmarks > 0,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}
