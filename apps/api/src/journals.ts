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
import { z } from 'zod';
import {
  currentTimestamp,
  type Database,
  reviseUntilCurrent,
  scalar,
  unrevisedRecord
} from './db/client.ts';
import {
  chapters,
  images,
  journalBookmarks,
  journalRevisions,
  journals,
  users
} from './db/schema.ts';
import { first } from './routing.ts';
import { truncate } from './text.ts';
import { userColumns, userSummary } from './users.ts';
import { optionalText, text } from './validation.ts';
import type { Viewer } from './visibility.ts';

const JOURNAL_TITLE_LIMIT = 50;
const JOURNAL_DESCRIPTION_LIMIT = 200;

export const journalInput = z.object({
  title: text({
    required: 'journal_title_required',
    max: { length: JOURNAL_TITLE_LIMIT, error: 'journal_title_exceed' }
  }).optional(),
  description: optionalText({
    length: JOURNAL_DESCRIPTION_LIMIT,
    error: 'journal_description_exceed'
  }).optional()
});

type JournalContent = { title: string; description: string | null };

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

export function reviseJournal(
  db: Database,
  userId: number,
  changes: z.output<typeof journalInput>
): Promise<void> {
  return reviseUntilCurrent(journalRevisions.journalId, () =>
    writeJournal(db, userId, changes)
  );
}

async function writeJournal(
  db: Database,
  userId: number,
  changes: z.output<typeof journalInput>
): Promise<void> {
  const journal = first(
    await db
      .select({
        id: journals.id,
        title: journals.title,
        description: journals.description,
        currentRevisionId: journals.currentRevisionId
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
      journalId: unrevisedRecord(db, journals, journal),
      userId,
      content,
      now
    })
  ]);
}

export async function viewerJournals(
  db: Database,
  viewer: Viewer,
  condition: SQL | undefined
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
