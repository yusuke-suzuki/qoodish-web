import { eq } from 'drizzle-orm';
import { type Database, database } from '../db/client.ts';
import {
  bookmarks,
  chapterRevisionImages,
  chapterRevisions,
  chapters,
  coauthorships,
  comments,
  featuredMaps,
  images,
  journals,
  mapRevisionImages,
  mapRevisions,
  maps,
  moderationDecisions,
  pinProperties,
  pinPropertyOptions,
  pinRevisionImages,
  pinRevisionPropertyOptions,
  pinRevisions,
  pins,
  staffMembers,
  users,
  votes
} from '../db/schema.ts';

export const IMAGE_BASE = 'https://imagedelivery.net/hash/qoodish';

export function at(day: number, micros = 0): string {
  return `2026-01-${String(day).padStart(2, '0')}T00:00:00.${String(micros).padStart(6, '0')}Z`;
}

export const CHAPTER_CONTENT = {
  root: {
    children: [{ children: [{ text: 'Noodles by the river', type: 'text' }] }],
    type: 'root'
  }
};

export const MAP_FEATURES = {
  features: [
    {
      geometry: { coordinates: [139.7, 35.6], type: 'Point' },
      properties: { title: 'Stall' },
      type: 'Feature'
    }
  ],
  type: 'FeatureCollection'
};

export const FEED_PIN_COUNT = 13;

export const ids = {
  alice: 1,
  bob: 2,
  carol: 3,
  aliceImage: 1,
  ramenImage: 2,
  shoyuImage: 3,
  shoyuSecondImage: 4,
  chapterImage: 5,
  ramen: 1,
  secret: 2,
  deletedMap: 3,
  removedMap: 4,
  cafe: 5,
  reinstatedMap: 6,
  shoyu: 1,
  deletedPin: 2,
  removedPin: 3,
  secretPin: 4,
  latte: 5,
  feedPins: 100,
  taste: 1,
  retiredProperty: 2,
  salty: 1,
  sweet: 2,
  noodleStory: 1,
  draft: 2,
  secretStory: 3,
  cafeStory: 4,
  pinComment: 1,
  deletedPinComment: 2,
  removedPinComment: 3,
  chapterComment: 4,
  deletedChapterComment: 5,
  removedChapterComment: 6
} as const;

function decision(
  id: number,
  type: string,
  moderatableId: number,
  outcome: 'removed' | 'kept',
  createdAt: string
) {
  return {
    id,
    moderatableType: type,
    moderatableId,
    outcome,
    reason: 'Reviewed',
    staffMemberId: 1,
    createdAt
  };
}

async function linkRevision(
  db: Database,
  table: typeof maps | typeof pins | typeof chapters,
  id: number,
  revisionId: number
) {
  await db
    .update(table)
    .set({ currentRevisionId: revisionId })
    .where(eq(table.id, id));
}

export async function seedWorld(binding: D1Database): Promise<void> {
  const db = database(binding);
  const stamp = { createdAt: at(1), updatedAt: at(1) };

  await db.insert(users).values([
    {
      id: ids.alice,
      uid: 'alice',
      name: 'Alice',
      biography: 'Ramen walker',
      ...stamp
    },
    { id: ids.bob, uid: 'bob', name: 'Bob', biography: null, ...stamp },
    {
      id: ids.carol,
      uid: 'carol',
      name: 'Carol',
      biography: null,
      createdAt: at(2),
      updatedAt: at(3)
    }
  ]);
  await db.insert(images).values([
    {
      id: ids.aliceImage,
      userId: ids.alice,
      url: `${IMAGE_BASE}/alice/public`,
      ...stamp
    },
    {
      id: ids.ramenImage,
      userId: ids.alice,
      url: `${IMAGE_BASE}/ramen/public`,
      ...stamp
    },
    {
      id: ids.shoyuImage,
      userId: ids.alice,
      url: `${IMAGE_BASE}/shoyu/public`,
      ...stamp
    },
    {
      id: ids.shoyuSecondImage,
      userId: ids.alice,
      url: `${IMAGE_BASE}/shoyu-2/public`,
      ...stamp
    },
    {
      id: ids.chapterImage,
      userId: ids.alice,
      url: `${IMAGE_BASE}/story/public`,
      ...stamp
    }
  ]);
  await db
    .update(users)
    .set({ imageId: ids.aliceImage })
    .where(eq(users.id, ids.alice));
  await db.insert(journals).values([
    {
      id: 1,
      userId: ids.alice,
      title: "Alice's journal",
      description: null,
      ...stamp
    }
  ]);
  await db
    .insert(staffMembers)
    .values([{ id: 1, email: 'staff@example.com', ...stamp }]);

  const map = (
    id: number,
    userId: number,
    name: string,
    day: number,
    overrides: Partial<typeof maps.$inferInsert> = {}
  ) => ({
    id,
    userId,
    name,
    description: `About ${name}`,
    latitude: 35.681382,
    longitude: 139.766084,
    private: false,
    status: 'published',
    createdAt: at(day),
    updatedAt: at(day, 1),
    ...overrides
  });

  await db.insert(maps).values([
    map(ids.ramen, ids.alice, 'Tokyo Ramen', 10),
    map(ids.secret, ids.alice, 'Secret Spots', 11, { private: true }),
    map(ids.deletedMap, ids.alice, 'Gone Ramen', 12, { status: 'deleted' }),
    map(ids.removedMap, ids.bob, 'Removed Ramen', 13),
    map(ids.cafe, ids.bob, 'Kyoto Cafe', 14, {
      latitude: 35,
      longitude: 135.5
    }),
    map(ids.reinstatedMap, ids.bob, 'Reinstated Map', 9)
  ]);
  await db.insert(mapRevisions).values([
    {
      id: 1,
      mapId: ids.ramen,
      userId: ids.alice,
      name: 'Tokyo Ramen',
      description: 'About Tokyo Ramen',
      latitude: 35.681382,
      longitude: 139.766084,
      private: false,
      ...stamp
    }
  ]);
  await db
    .insert(mapRevisionImages)
    .values([{ mapRevisionId: 1, imageId: ids.ramenImage, ...stamp }]);
  await linkRevision(db, maps, ids.ramen, 1);
  await db
    .insert(coauthorships)
    .values([{ mapId: ids.ramen, userId: ids.carol, ...stamp }]);
  await db.insert(bookmarks).values([
    { mapId: ids.cafe, userId: ids.alice, ...stamp },
    { mapId: ids.cafe, userId: ids.carol, ...stamp },
    { mapId: ids.ramen, userId: ids.bob, ...stamp },
    { mapId: ids.deletedMap, userId: ids.bob, ...stamp }
  ]);
  await db.insert(featuredMaps).values([
    { id: 1, mapId: ids.cafe, createdAt: at(15), updatedAt: at(15) },
    { id: 2, mapId: ids.removedMap, createdAt: at(16), updatedAt: at(16) }
  ]);

  const pin = (
    id: number,
    mapId: number,
    userId: number,
    name: string,
    createdAt: string,
    overrides: Partial<typeof pins.$inferInsert> = {}
  ) => ({
    id,
    mapId,
    userId,
    name,
    comment: `Notes on ${name}`,
    latitude: 35.7,
    longitude: 139.7,
    status: 'published',
    createdAt,
    updatedAt: createdAt,
    ...overrides
  });

  const pinRows = [
    pin(ids.shoyu, ids.ramen, ids.alice, 'Shoyu Ramen', at(20)),
    pin(ids.deletedPin, ids.ramen, ids.alice, 'Gone Shoyu', at(21), {
      status: 'deleted'
    }),
    pin(ids.removedPin, ids.ramen, ids.alice, 'Removed Shoyu', at(22)),
    pin(ids.secretPin, ids.secret, ids.alice, 'Secret Shoyu', at(23)),
    pin(ids.latte, ids.cafe, ids.bob, 'Matcha Latte', at(24)),
    ...Array.from({ length: FEED_PIN_COUNT }, (_, index) =>
      pin(
        ids.feedPins + index,
        ids.cafe,
        ids.bob,
        `Feed ${index}`,
        index === 0 ? at(25, 1) : at(25 + Math.floor(index / 3), index % 3)
      )
    )
  ];

  for (const row of pinRows) {
    await db.insert(pins).values(row);
  }

  await db.insert(pinRevisions).values([
    {
      id: 1,
      pinId: ids.shoyu,
      userId: ids.alice,
      name: 'Shoyu Ramen',
      comment: 'Notes on Shoyu Ramen',
      latitude: 35.7,
      longitude: 139.7,
      ...stamp
    }
  ]);
  await db.insert(pinRevisionImages).values([
    { pinRevisionId: 1, imageId: ids.shoyuSecondImage, ...stamp },
    { pinRevisionId: 1, imageId: ids.shoyuImage, ...stamp }
  ]);
  await db.insert(pinProperties).values([
    {
      id: ids.taste,
      mapId: ids.ramen,
      name: 'Taste',
      position: 1,
      multiple: true,
      ...stamp
    },
    {
      id: ids.retiredProperty,
      mapId: ids.ramen,
      name: 'Retired',
      position: 0,
      status: 'deleted',
      ...stamp
    }
  ]);
  await db.insert(pinPropertyOptions).values([
    {
      id: ids.salty,
      pinPropertyId: ids.taste,
      name: 'Salty',
      position: 0,
      ...stamp
    },
    {
      id: ids.sweet,
      pinPropertyId: ids.taste,
      name: 'Sweet',
      position: 1,
      status: 'deleted',
      ...stamp
    }
  ]);
  await db.insert(pinRevisionPropertyOptions).values([
    { pinRevisionId: 1, pinPropertyOptionId: ids.sweet, ...stamp },
    { pinRevisionId: 1, pinPropertyOptionId: ids.salty, ...stamp }
  ]);
  await linkRevision(db, pins, ids.shoyu, 1);

  const chapter = (
    id: number,
    userId: number,
    mapId: number,
    title: string,
    day: number,
    status = 'published'
  ) => ({
    id,
    userId,
    mapId,
    title,
    status,
    content: JSON.stringify(CHAPTER_CONTENT),
    contentText: '["Noodles by the river"]',
    mapFeatures: JSON.stringify(MAP_FEATURES),
    createdAt: at(day),
    updatedAt: at(day, 5)
  });

  await db
    .insert(chapters)
    .values([
      chapter(ids.noodleStory, ids.alice, ids.ramen, 'Noodle Story', 10),
      chapter(ids.draft, ids.alice, ids.ramen, 'Draft Story', 11, 'draft'),
      chapter(ids.secretStory, ids.alice, ids.secret, 'Secret Story', 12),
      chapter(ids.cafeStory, ids.bob, ids.cafe, 'Cafe Story', 13)
    ]);
  await db.insert(chapterRevisions).values([
    {
      id: 1,
      chapterId: ids.noodleStory,
      userId: ids.alice,
      title: 'Noodle Story',
      status: 'published',
      content: JSON.stringify(CHAPTER_CONTENT),
      mapFeatures: JSON.stringify(MAP_FEATURES),
      ...stamp
    }
  ]);
  await db
    .insert(chapterRevisionImages)
    .values([{ chapterRevisionId: 1, imageId: ids.chapterImage, ...stamp }]);
  await linkRevision(db, chapters, ids.noodleStory, 1);

  const comment = (
    id: number,
    type: 'Pin' | 'Chapter',
    commentableId: number,
    userId: number,
    status = 'published'
  ) => ({
    id,
    commentableType: type,
    commentableId,
    userId,
    body: `Comment ${id}`,
    status,
    createdAt: at(26, id),
    updatedAt: at(26, id)
  });

  await db
    .insert(comments)
    .values([
      comment(ids.pinComment, 'Pin', ids.shoyu, ids.bob),
      comment(ids.deletedPinComment, 'Pin', ids.shoyu, ids.bob, 'deleted'),
      comment(ids.removedPinComment, 'Pin', ids.shoyu, ids.carol),
      comment(ids.chapterComment, 'Chapter', ids.noodleStory, ids.bob),
      comment(
        ids.deletedChapterComment,
        'Chapter',
        ids.noodleStory,
        ids.bob,
        'deleted'
      ),
      comment(ids.removedChapterComment, 'Chapter', ids.noodleStory, ids.carol)
    ]);

  const vote = (votableType: string, votableId: number, voterId: number) => ({
    votableType,
    votableId,
    voterId,
    voterType: 'User',
    voteFlag: true,
    ...stamp
  });

  await db
    .insert(votes)
    .values([
      vote('Pin', ids.shoyu, ids.bob),
      vote('Pin', ids.shoyu, ids.carol),
      vote('Pin', ids.latte, ids.alice),
      vote('Comment', ids.pinComment, ids.alice),
      vote('Chapter', ids.noodleStory, ids.bob),
      vote('Map', ids.ramen, ids.alice)
    ]);
  await db
    .insert(moderationDecisions)
    .values([
      decision(1, 'Map', ids.removedMap, 'removed', at(17)),
      decision(2, 'Map', ids.reinstatedMap, 'removed', at(17)),
      decision(3, 'Map', ids.reinstatedMap, 'kept', at(18)),
      decision(4, 'Pin', ids.removedPin, 'removed', at(27)),
      decision(5, 'Comment', ids.removedPinComment, 'removed', at(27)),
      decision(6, 'Comment', ids.removedChapterComment, 'removed', at(27))
    ]);
}
