import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get, idsOf } from '../../test/client.ts';
import { variants } from '../../test/serialized.ts';
import {
  at,
  CHAPTER_CONTENT,
  IMAGE_BASE,
  ids,
  MAP_FEATURES,
  seedWorld
} from '../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

const noodleStory = {
  id: ids.noodleStory,
  map_id: ids.ramen,
  journey_id: null,
  title: 'Noodle Story',
  status: 'published',
  content: CHAPTER_CONTENT,
  map_features: MAP_FEATURES,
  image: variants('story'),
  image_url: `${IMAGE_BASE}/story/public`,
  author: {
    id: ids.alice,
    name: 'Alice',
    biography: 'Ramen walker',
    image: variants('alice'),
    image_url: `${IMAGE_BASE}/alice/public`
  },
  map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
  journal: { id: 1, title: "Alice's journal" },
  likes_count: 1,
  created_at: at(10),
  updated_at: at(10, 5)
};

describe('GET /guest/chapters', () => {
  it('serializes a public chapter with its comment count', async () => {
    const { status, body } = await get(`/guest/chapters/${ids.noodleStory}`);

    expect(status).toBe(200);
    expect(JSON.stringify(body)).toBe(
      JSON.stringify({ ...noodleStory, comments_count: 2 })
    );
  });

  it('hides drafts and chapters on private maps', async () => {
    for (const id of [ids.draft, ids.secretStory]) {
      expect((await get(`/guest/chapters/${id}`)).status).toBe(404);
    }
  });

  it('lists the latest public chapters', async () => {
    expect(await idsOf('/guest/chapters')).toEqual([
      ids.cafeStory,
      ids.noodleStory
    ]);
  });

  it('gives a chapter without a journal a null journal', async () => {
    const { body } = await get(`/guest/chapters/${ids.cafeStory}`);

    expect(body).toMatchObject({ journal: null, image: null, image_url: '' });
  });

  it('lists the comments that are not deleted, removed ones included', async () => {
    expect(await idsOf(`/guest/chapters/${ids.noodleStory}/comments`)).toEqual([
      ids.chapterComment,
      ids.removedChapterComment
    ]);
  });
});
