import { eq } from 'drizzle-orm';
import { database } from '../db/client.ts';
import {
  blocks,
  chapters,
  coauthorshipInvitations,
  images,
  journalBookmarks,
  journeyCheckinRevisionImages,
  journeyCheckinRevisions,
  journeyCheckins,
  journeys,
  milestones,
  mutes,
  notifications,
  unblocks,
  userPreferences,
  users
} from '../db/schema.ts';
import { at, IMAGE_BASE, ids } from './world.ts';

const ENCODED_PATH =
  '{"p":"kAB2zxHkHX4rYQ==","h":{"iv":"2wBiU3O0tPXjfxft","at":"ipz2YrcxjHmajSKRGx0zYg=="}}';

export const dave = 4;
export const checkinImage = 6;

export async function seedMe(binding: D1Database): Promise<void> {
  const db = database(binding);
  const stamp = { createdAt: at(1), updatedAt: at(1) };

  await db
    .insert(users)
    .values({ id: dave, uid: 'dave', name: 'Dave', ...stamp });
  await db.insert(userPreferences).values([
    { userId: ids.alice, webPush: '{"liked":false}', ...stamp },
    {
      userId: ids.alice,
      webPush: '{"comment":false,"retired":true}',
      ...stamp
    }
  ]);
  await db.insert(coauthorshipInvitations).values([
    {
      id: 1,
      mapId: ids.ramen,
      inviterId: ids.alice,
      inviteeId: ids.bob,
      status: 0,
      createdAt: at(3),
      updatedAt: at(3)
    },
    {
      id: 2,
      mapId: ids.secret,
      inviterId: ids.alice,
      inviteeId: ids.bob,
      status: 1,
      ...stamp
    }
  ]);
  await db.insert(blocks).values([
    { id: 1, blockerId: ids.alice, blockedId: dave, createdAt: at(2) },
    { id: 2, blockerId: ids.alice, blockedId: ids.carol, createdAt: at(2) }
  ]);
  await db.insert(unblocks).values({ blockId: 2, createdAt: at(3) });
  await db
    .insert(mutes)
    .values({ muterId: ids.carol, mutedId: ids.bob, createdAt: at(2) });
  await db
    .insert(journalBookmarks)
    .values({ journalId: 1, userId: ids.bob, ...stamp });

  await db.insert(journeys).values([
    {
      id: 1,
      userId: ids.alice,
      mapId: ids.ramen,
      startedAt: at(5),
      finishedAt: at(6),
      encodedPath: ENCODED_PATH,
      createdAt: at(4),
      updatedAt: at(6)
    },
    {
      id: 2,
      userId: ids.alice,
      mapId: null,
      createdAt: at(7),
      updatedAt: at(7)
    }
  ]);
  await db
    .update(chapters)
    .set({ journeyId: 1 })
    .where(eq(chapters.id, ids.noodleStory));
  await db.insert(milestones).values([
    {
      id: 1,
      journeyId: 1,
      pinId: ids.shoyu,
      name: 'Shoyu Ramen',
      latitude: 35.7,
      longitude: 139.7,
      position: 2,
      ...stamp
    },
    {
      id: 2,
      journeyId: 1,
      pinId: null,
      name: 'Gone Stall',
      latitude: 35.6,
      longitude: 139.6,
      position: 1,
      ...stamp
    }
  ]);
  const checkin = (id: number, checkedInAt: string, status = 'recorded') => ({
    id,
    journeyId: 1,
    pinId: null,
    name: `Spot ${id}`,
    latitude: 35.5,
    longitude: 139.5,
    note: `Note ${id}`,
    checkedInAt,
    status,
    ...stamp
  });
  await db
    .insert(journeyCheckins)
    .values([
      checkin(1, at(5, 10)),
      checkin(2, at(5, 1), 'deleted'),
      checkin(3, at(5, 5))
    ]);
  await db.insert(journeyCheckinRevisions).values({
    id: 1,
    journeyCheckinId: 3,
    userId: ids.alice,
    checkedInAt: at(5, 5),
    note: 'Note 3',
    ...stamp
  });
  await db.insert(images).values({
    id: checkinImage,
    userId: ids.alice,
    url: `${IMAGE_BASE}/spot/public`,
    ...stamp
  });
  await db
    .insert(journeyCheckinRevisionImages)
    .values({ journeyCheckinRevisionId: 1, imageId: checkinImage, ...stamp });
  await db
    .update(journeyCheckins)
    .set({ currentRevisionId: 1 })
    .where(eq(journeyCheckins.id, 3));

  const notification = (
    id: number,
    key: string,
    notifiableType: string,
    notifiableId: number,
    notifierId: number,
    read = false
  ) => ({
    id,
    key,
    notifiableType,
    notifiableId,
    notifierType: 'User',
    notifierId,
    recipientType: 'User',
    recipientId: ids.alice,
    read,
    createdAt: at(10, id),
    updatedAt: at(10, id)
  });
  for (const row of [
    notification(1, 'liked', 'Pin', ids.shoyu, ids.bob),
    notification(2, 'liked', 'Pin', ids.shoyu, ids.carol),
    notification(3, 'liked', 'Pin', ids.shoyu, ids.bob),
    notification(4, 'comment', 'Pin', ids.shoyu, ids.bob, true),
    notification(5, 'liked', 'Comment', ids.pinComment, ids.carol),
    notification(6, 'published', 'Chapter', ids.draft, ids.carol),
    notification(7, 'liked', 'Pin', ids.deletedPin, ids.bob),
    notification(8, 'followed', 'Map', ids.ramen, ids.bob),
    notification(9, 'liked', 'Pin', ids.shoyu, dave),
    notification(10, 'coauthor_invited', 'Map', ids.cafe, ids.bob)
  ]) {
    await db.insert(notifications).values(row);
  }
}
