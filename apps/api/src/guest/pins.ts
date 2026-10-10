import type { GuestPin, GuestPinComment } from '@qoodish/api-contract';
import { and, asc, count, eq } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import {
  images,
  maps,
  pinRevisionImages,
  pinRevisionPropertyOptions,
  type pins,
  votes
} from '../db/schema.ts';
import { image } from '../images.ts';
import { commentsQuery, guestComment } from './comments.ts';
import { type UserRow, userSummary, usersQuery } from './users.ts';

export type PinRow = typeof pins.$inferSelect;

function groupBy<Row, Key, Value>(
  rows: readonly Row[],
  key: (row: Row) => Key,
  value: (row: Row) => Value
): Map<Key, Value[]> {
  const groups = new Map<Key, Value[]>();

  for (const row of rows) {
    const group = groups.get(key(row));

    if (group) {
      group.push(value(row));
    } else {
      groups.set(key(row), [value(row)]);
    }
  }

  return groups;
}

export async function guestPins(
  db: Database,
  rows: readonly PinRow[]
): Promise<GuestPin[]> {
  if (rows.length === 0) {
    return [];
  }

  const pinIds = rows.map((row) => row.id);
  const revisionIds = uniqueIds(rows.map((row) => row.currentRevisionId));

  const [authors, mapRefs, revisionImages, propertyOptions, likes, comments] =
    await db.batch([
      usersQuery(db, uniqueIds(rows.map((row) => row.userId))),
      db
        .select({ id: maps.id, name: maps.name, private: maps.private })
        .from(maps)
        .where(inIds(maps.id, uniqueIds(rows.map((row) => row.mapId)))),
      db
        .select({
          revisionId: pinRevisionImages.pinRevisionId,
          id: images.id,
          url: images.url
        })
        .from(pinRevisionImages)
        .innerJoin(images, eq(images.id, pinRevisionImages.imageId))
        .where(inIds(pinRevisionImages.pinRevisionId, revisionIds))
        .orderBy(asc(images.id)),
      db
        .select({
          revisionId: pinRevisionPropertyOptions.pinRevisionId,
          optionId: pinRevisionPropertyOptions.pinPropertyOptionId
        })
        .from(pinRevisionPropertyOptions)
        .where(inIds(pinRevisionPropertyOptions.pinRevisionId, revisionIds))
        .orderBy(asc(pinRevisionPropertyOptions.pinPropertyOptionId)),
      db
        .select({ pinId: votes.votableId, likes: count() })
        .from(votes)
        .where(
          and(eq(votes.votableType, 'Pin'), inIds(votes.votableId, pinIds))
        )
        .groupBy(votes.votableId),
      commentsQuery(db, 'Pin', pinIds, { visibleOnly: true })
    ]);

  const authorsById = new Map<number, UserRow>(
    authors.map((author) => [author.id, author])
  );
  const mapsById = new Map(mapRefs.map((map) => [map.id, map]));
  const imagesByRevision = groupBy(
    revisionImages,
    (row) => row.revisionId,
    (row) => image(row.id, row.url)
  );
  const optionsByRevision = groupBy(
    propertyOptions,
    (row) => row.revisionId,
    (row) => row.optionId
  );
  const likesByPin = new Map(likes.map((row) => [row.pinId, row.likes]));
  const commentsByPin = groupBy(
    comments,
    (row) => row.commentableId,
    (row) => row
  );

  return rows.flatMap((row) => {
    const author = authorsById.get(row.userId);
    const map = mapsById.get(row.mapId);

    if (!author || !map) {
      return [];
    }

    const revision = row.currentRevisionId;

    return [
      {
        id: row.id,
        name: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        author: userSummary(author),
        comment: row.comment,
        comments: (commentsByPin.get(row.id) ?? []).map(
          (comment): GuestPinComment => ({
            ...guestComment(comment),
            pin_id: row.id
          })
        ),
        images:
          (revision === null ? undefined : imagesByRevision.get(revision)) ??
          [],
        property_option_ids:
          (revision === null ? undefined : optionsByRevision.get(revision)) ??
          [],
        map: { id: row.mapId, name: map.name, private: map.private as boolean },
        likes_count: likesByPin.get(row.id) ?? 0,
        created_at: row.createdAt,
        updated_at: row.updatedAt
      }
    ];
  });
}
