import type {
  GuestPin,
  GuestPinComment,
  Image,
  MapRef
} from '@qoodish/api-contract';
import { asc, eq } from 'drizzle-orm';
import { type Database, inIds, uniqueIds } from '../db/client.ts';
import {
  images,
  maps,
  pinRevisionImages,
  pinRevisionPropertyOptions,
  type pins
} from '../db/schema.ts';
import { image } from '../images.ts';
import { type Likes, likesByVotable, likesQuery } from '../votes.ts';
import {
  type CommentRow,
  type CommentsOptions,
  commentsQuery,
  guestComment
} from './comments.ts';
import { type UserRow, userSummary, usersQuery } from './users.ts';

export type PinRow = typeof pins.$inferSelect;

export type PinParts = {
  row: PinRow;
  author: UserRow;
  map: MapRef;
  images: Image[];
  propertyOptionIds: number[];
  likes: Likes;
  comments: CommentRow[];
};

export async function loadPins(
  db: Database,
  rows: readonly PinRow[],
  options: CommentsOptions
): Promise<PinParts[]> {
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
      likesQuery(db, 'Pin', pinIds, options.viewerId),
      commentsQuery(db, 'Pin', pinIds, options)
    ]);

  const authorsById = new Map<number, UserRow>(
    authors.map((author) => [author.id, author])
  );
  const mapsById = new Map(mapRefs.map((map) => [map.id, map]));
  const imagesByRevision = Map.groupBy(revisionImages, (row) => row.revisionId);
  const optionsByRevision = Map.groupBy(
    propertyOptions,
    (row) => row.revisionId
  );
  const likesOf = likesByVotable(likes);
  const commentsByPin = Map.groupBy(comments, (row) => row.commentableId);

  return rows.flatMap((row) => {
    const author = authorsById.get(row.userId);
    const map = mapsById.get(row.mapId);

    if (!author || !map) {
      return [];
    }

    const revision = row.currentRevisionId;

    return [
      {
        row,
        author,
        map: { id: map.id, name: map.name, private: map.private as boolean },
        images: (
          (revision === null ? undefined : imagesByRevision.get(revision)) ?? []
        ).map((revisionImage) => image(revisionImage.id, revisionImage.url)),
        propertyOptionIds: (
          (revision === null ? undefined : optionsByRevision.get(revision)) ??
          []
        ).map((option) => option.optionId),
        likes: likesOf(row.id),
        comments: commentsByPin.get(row.id) ?? []
      }
    ];
  });
}

export async function guestPins(
  db: Database,
  rows: readonly PinRow[]
): Promise<GuestPin[]> {
  const parts = await loadPins(db, rows, { visibleOnly: true });

  return parts.map(({ row, author, map, ...pin }) => ({
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    author: userSummary(author),
    comment: row.comment,
    comments: pin.comments.map(
      (comment): GuestPinComment => ({
        ...guestComment(comment),
        pin_id: row.id
      })
    ),
    images: pin.images,
    property_option_ids: pin.propertyOptionIds,
    map,
    likes_count: pin.likes.likes,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}
