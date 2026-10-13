import {
  and,
  eq,
  inArray,
  ne,
  notExists,
  or,
  type SQLWrapper
} from 'drizzle-orm';
import {
  currentTimestamp,
  type Database,
  generatedId,
  selected
} from './db/client.ts';
import {
  bookmarks,
  coauthorships,
  journalBookmarks,
  journals,
  maps
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import { type MapRow, mapIdsOf } from './maps.ts';
import { first } from './routing.ts';
import { noBlockBetween, publicMap } from './visibility.ts';

function mapBookmarkable(db: Database, viewerId: number) {
  return and(
    publicMap(),
    ne(maps.userId, viewerId),
    notExists(
      db
        .select({ id: coauthorships.id })
        .from(coauthorships)
        .where(
          and(
            eq(coauthorships.mapId, maps.id),
            eq(coauthorships.userId, viewerId)
          )
        )
    )
  );
}

async function assertMapBookmarkable(
  db: Database,
  viewerId: number,
  mapId: number
): Promise<MapRow> {
  const [[map], coauthored, bookmarked, unblocked] = await db.batch([
    db
      .select()
      .from(maps)
      .where(and(publicMap(), eq(maps.id, mapId))),
    db
      .select({ id: coauthorships.id })
      .from(coauthorships)
      .where(
        and(eq(coauthorships.mapId, mapId), eq(coauthorships.userId, viewerId))
      ),
    db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.mapId, mapId), eq(bookmarks.userId, viewerId))),
    db
      .select({ id: maps.id })
      .from(maps)
      .where(and(eq(maps.id, mapId), noBlockBetween(db, maps.userId, viewerId)))
  ]);

  if (!map) {
    throw new ApiError('NotFound');
  }

  if (map.userId === viewerId || coauthored.length > 0) {
    throw new ApiError('Forbidden');
  }

  const errors: MessageKey[] = [
    ...(bookmarked.length > 0 ? (['duplicate_bookmark'] as const) : []),
    ...(unblocked.length === 0
      ? (['bookmark_blocked_interaction'] as const)
      : [])
  ];

  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }

  return map;
}

export async function bookmarkMap(
  db: Database,
  viewerId: number,
  mapId: number
): Promise<MapRow> {
  const map = await assertMapBookmarkable(db, viewerId, mapId);
  const now = currentTimestamp();
  const inserted = await db
    .insert(bookmarks)
    .select(
      db
        .select({
          id: generatedId(),
          createdAt: selected(now, 'created_at'),
          mapId: maps.id,
          updatedAt: selected(now, 'updated_at'),
          userId: selected(viewerId, 'user_id')
        })
        .from(maps)
        .where(
          and(
            eq(maps.id, mapId),
            mapBookmarkable(db, viewerId),
            noBlockBetween(db, maps.userId, viewerId)
          )
        )
    )
    .onConflictDoNothing()
    .returning({ id: bookmarks.id });

  if (inserted.length === 0) {
    await assertMapBookmarkable(db, viewerId, mapId);
    throw new ApiError('Conflict');
  }

  return map;
}

export async function unbookmarkMap(
  db: Database,
  { userId, mapId }: { userId: number; mapId: number }
): Promise<MapRow> {
  const [removed, [map]] = await db.batch([
    db
      .delete(bookmarks)
      .where(and(eq(bookmarks.mapId, mapId), eq(bookmarks.userId, userId)))
      .returning({ id: bookmarks.id }),
    db.select().from(maps).where(eq(maps.id, mapId))
  ]);

  if (removed.length === 0 || !map) {
    throw new ApiError('NotFound');
  }

  return map;
}

export function removeMapBookmarks(db: Database, mapId: number) {
  return db.delete(bookmarks).where(eq(bookmarks.mapId, mapId));
}

async function assertJournalBookmarkable(
  db: Database,
  viewerId: number,
  journalId: number
): Promise<void> {
  const [journalRows, bookmarked, unblocked] = await db.batch([
    db
      .select({ userId: journals.userId })
      .from(journals)
      .where(eq(journals.id, journalId)),
    db
      .select({ id: journalBookmarks.id })
      .from(journalBookmarks)
      .where(
        and(
          eq(journalBookmarks.journalId, journalId),
          eq(journalBookmarks.userId, viewerId)
        )
      ),
    db
      .select({ id: journals.id })
      .from(journals)
      .where(
        and(
          eq(journals.id, journalId),
          noBlockBetween(db, journals.userId, viewerId)
        )
      )
  ]);
  const journal = first(journalRows);

  if (journal.userId === viewerId) {
    throw new ApiError('Forbidden');
  }

  const errors: MessageKey[] = [
    ...(bookmarked.length > 0 ? (['duplicate_journal_bookmark'] as const) : []),
    ...(unblocked.length === 0
      ? (['journal_bookmark_blocked_interaction'] as const)
      : [])
  ];

  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }
}

export async function bookmarkJournal(
  db: Database,
  viewerId: number,
  journalId: number
): Promise<void> {
  await assertJournalBookmarkable(db, viewerId, journalId);

  const now = currentTimestamp();
  const inserted = await db
    .insert(journalBookmarks)
    .select(
      db
        .select({
          id: generatedId(),
          createdAt: selected(now, 'created_at'),
          journalId: journals.id,
          updatedAt: selected(now, 'updated_at'),
          userId: selected(viewerId, 'user_id')
        })
        .from(journals)
        .where(
          and(
            eq(journals.id, journalId),
            ne(journals.userId, viewerId),
            noBlockBetween(db, journals.userId, viewerId)
          )
        )
    )
    .onConflictDoNothing()
    .returning({ id: journalBookmarks.id });

  if (inserted.length === 0) {
    await assertJournalBookmarkable(db, viewerId, journalId);
    throw new ApiError('Conflict');
  }
}

export async function unbookmarkJournal(
  db: Database,
  { userId, journalId }: { userId: number; journalId: number }
): Promise<void> {
  const removed = await db
    .delete(journalBookmarks)
    .where(
      and(
        eq(journalBookmarks.journalId, journalId),
        eq(journalBookmarks.userId, userId)
      )
    )
    .returning({ id: journalBookmarks.id });

  if (removed.length === 0) {
    throw new ApiError('NotFound');
  }
}

export function removeBookmarksBetween(
  db: Database,
  [userId, otherId]: readonly [number, number]
) {
  const onMapsOf = (bookmarkerId: number, authorId: number) =>
    and(
      eq(bookmarks.userId, bookmarkerId),
      inArray(bookmarks.mapId, mapIdsOf(db, authorId))
    );
  const onJournalOf = (bookmarkerId: number, authorId: number) =>
    and(
      eq(journalBookmarks.userId, bookmarkerId),
      inArray(
        journalBookmarks.journalId,
        db
          .select({ id: journals.id })
          .from(journals)
          .where(eq(journals.userId, authorId))
      )
    );

  return [
    db
      .delete(bookmarks)
      .where(or(onMapsOf(userId, otherId), onMapsOf(otherId, userId))),
    db
      .delete(journalBookmarks)
      .where(or(onJournalOf(userId, otherId), onJournalOf(otherId, userId)))
  ] as const;
}

export function bookmarksDeletion(
  db: Database,
  { userId, mapIds }: { userId: number; mapIds: SQLWrapper }
) {
  return db
    .delete(bookmarks)
    .where(or(inArray(bookmarks.mapId, mapIds), eq(bookmarks.userId, userId)));
}

export function journalBookmarksDeletion(
  db: Database,
  { userId, journalIds }: { userId: number; journalIds: SQLWrapper }
) {
  return db
    .delete(journalBookmarks)
    .where(
      or(
        inArray(journalBookmarks.journalId, journalIds),
        eq(journalBookmarks.userId, userId)
      )
    );
}
