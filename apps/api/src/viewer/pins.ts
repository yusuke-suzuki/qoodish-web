import type { Pin } from '@qoodish/api-contract';
import type { Database } from '../db/client.ts';
import { comments } from '../db/schema.ts';
import { loadPins, type PinRow } from '../guest/pins.ts';
import { userSummary } from '../guest/users.ts';
import { shownTo, type Viewer } from '../visibility.ts';
import { viewerComment } from './comments.ts';
import { relation } from './context.ts';

export async function viewerPins(
  db: Database,
  viewer: Viewer,
  rows: readonly PinRow[]
): Promise<Pin[]> {
  const parts = await loadPins(db, rows, {
    visibleOnly: true,
    condition: shownTo(viewer, comments.userId),
    viewerId: viewer.id
  });

  return parts.map(({ row, author, map, ...pin }) => ({
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    author: { ...userSummary(author), ...relation(viewer, author.id) },
    comment: row.comment,
    comments: pin.comments.map((comment) => ({
      ...viewerComment(comment),
      pin_id: row.id
    })),
    images: pin.images,
    property_option_ids: pin.propertyOptionIds,
    map,
    editable: row.userId === viewer.id,
    liked: pin.likes.liked,
    likes_count: pin.likes.likes,
    created_at: row.createdAt,
    updated_at: row.updatedAt
  }));
}
