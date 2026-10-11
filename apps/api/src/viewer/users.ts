import type { UserProfile } from '@qoodish/api-contract';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/client.ts';
import { images, users } from '../db/schema.ts';
import { profileCounts, userColumns } from '../guest/users.ts';
import { primaryImage } from '../images.ts';
import type { Viewer } from './context.ts';

export async function userProfile(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<UserProfile | null> {
  const [user] = await db
    .select({ ...userColumns, uid: users.uid, ...profileCounts(db) })
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(eq(users.id, id));

  if (!user) {
    return null;
  }

  const { image, image_url } = primaryImage(user.imageUrl ?? undefined);

  return {
    id: user.id,
    uid: user.uid,
    name: user.name ?? '',
    biography: user.biography,
    image,
    image_url,
    maps_count: user.mapsCount,
    bookmarked_maps_count: user.bookmarkedMapsCount,
    pins_count: user.pinsCount,
    blocking: viewer.blocking.has(user.id),
    blocked_by: viewer.blockedBy.has(user.id),
    muting: viewer.muting.has(user.id)
  };
}
