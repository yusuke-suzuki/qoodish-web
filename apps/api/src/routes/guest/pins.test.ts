import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get, idsOf } from '../../test/client.ts';
import { alice, bob, variants } from '../../test/serialized.ts';
import { at, IMAGE_BASE, ids, seedWorld } from '../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

const shoyuPin = {
  id: ids.shoyu,
  name: 'Shoyu Ramen',
  latitude: 35.7,
  longitude: 139.7,
  author: alice,
  comment: 'Notes on Shoyu Ramen',
  comments: [
    {
      id: ids.pinComment,
      author: bob,
      body: `Comment ${ids.pinComment}`,
      likes_count: 1,
      created_at: at(26, ids.pinComment),
      updated_at: at(26, ids.pinComment),
      pin_id: ids.shoyu
    }
  ],
  images: [
    {
      id: ids.shoyuImage,
      url: `${IMAGE_BASE}/shoyu/public`,
      ...withoutUrl(variants('shoyu'))
    },
    {
      id: ids.shoyuSecondImage,
      url: `${IMAGE_BASE}/shoyu-2/public`,
      ...withoutUrl(variants('shoyu-2'))
    }
  ],
  property_option_ids: [ids.salty, ids.sweet],
  map: { id: ids.ramen, name: 'Tokyo Ramen', private: false },
  likes_count: 2,
  created_at: at(20),
  updated_at: at(20)
};

function withoutUrl({ url: _url, ...rest }: ReturnType<typeof variants>) {
  return rest;
}

describe('GET /guest/pins', () => {
  it('serializes a public pin with its visible comments', async () => {
    const { status, body } = await get(`/guest/pins/${ids.shoyu}`);

    expect(status).toBe(200);
    expect(JSON.stringify(body)).toBe(JSON.stringify(shoyuPin));
  });

  it('hides deleted, removed and private pins', async () => {
    for (const id of [ids.deletedPin, ids.removedPin, ids.secretPin]) {
      expect((await get(`/guest/pins/${id}`)).status).toBe(404);
    }
  });

  it('lists the eight most recent pins', async () => {
    expect(await idsOf('/guest/pins?recent=true')).toEqual([
      112, 111, 110, 109, 108, 107, 106, 105
    ]);
  });

  it('orders popular pins by likes', async () => {
    expect(await idsOf('/guest/pins?popular=true')).toEqual([
      ids.shoyu,
      ids.latte
    ]);
  });

  it('answers 400 without a listing parameter', async () => {
    expect((await get('/guest/pins')).status).toBe(400);
  });
});
