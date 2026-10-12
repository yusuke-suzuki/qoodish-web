import { database } from '../db/client.ts';
import {
  blocks,
  chapters,
  journalBookmarks,
  journals,
  maps,
  mutes,
  pins,
  unblocks,
  users
} from '../db/schema.ts';
import { at, CHAPTER_CONTENT, ids, MAP_FEATURES } from './world.ts';

export const dave = { id: 4, map: 7, pin: 50, chapter: 5, journal: 2 };

const stamp = { createdAt: at(1), updatedAt: at(1) };

export async function seedDave(binding: D1Database): Promise<void> {
  const db = database(binding);

  await db
    .insert(users)
    .values({ id: dave.id, uid: 'dave', name: 'Dave', ...stamp });
  await db
    .insert(journals)
    .values([
      { id: dave.journal, userId: dave.id, title: "Dave's journal", ...stamp }
    ]);
  await db.insert(maps).values({
    id: dave.map,
    userId: dave.id,
    name: 'Dave Diner',
    description: 'About Dave Diner',
    latitude: 35,
    longitude: 139,
    private: false,
    status: 'published',
    ...stamp
  });
  await db.insert(pins).values({
    id: dave.pin,
    mapId: dave.map,
    userId: dave.id,
    name: 'Dave Burger',
    comment: 'Notes on Dave Burger',
    latitude: 35,
    longitude: 139,
    status: 'published',
    ...stamp
  });
  await db.insert(chapters).values({
    id: dave.chapter,
    userId: dave.id,
    mapId: dave.map,
    title: 'Dave Story',
    status: 'published',
    content: JSON.stringify(CHAPTER_CONTENT),
    mapFeatures: JSON.stringify(MAP_FEATURES),
    ...stamp
  });
}

export async function seedRelations(binding: D1Database): Promise<void> {
  const db = database(binding);

  await db
    .insert(blocks)
    .values({ blockerId: dave.id, blockedId: ids.alice, createdAt: at(2) });

  const [lifted] = await db
    .insert(blocks)
    .values({ blockerId: ids.alice, blockedId: ids.carol, createdAt: at(2) })
    .returning({ id: blocks.id });

  await db.insert(unblocks).values({ blockId: lifted.id, createdAt: at(3) });
  await db
    .insert(mutes)
    .values({ muterId: ids.alice, mutedId: ids.bob, createdAt: at(2) });
  await db
    .insert(journalBookmarks)
    .values({ journalId: 1, userId: ids.bob, ...stamp });
}
