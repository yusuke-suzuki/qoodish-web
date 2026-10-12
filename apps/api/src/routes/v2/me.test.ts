import { env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';
import { get, idsOf } from '../../test/client.ts';
import { dave, seedMe } from '../../test/me.ts';
import { bob, carol, variants } from '../../test/serialized.ts';
import { at, IMAGE_BASE, ids, seedWorld } from '../../test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
  await seedMe(env.DB);
});

describe('GET /v2/me/notifications', () => {
  it('groups the renderable notifications from users the viewer sees', async () => {
    const { status, body } = await get('/v2/me/notifications', 'alice');

    expect(status).toBe(200);
    expect(body).toEqual({
      data: [
        {
          id: 10,
          key: 'coauthor_invited',
          click_action: '/coauthorship_invitations',
          notifiable: { id: ids.cafe, type: 'map', image: null, image_url: '' },
          notifier: bob,
          read: false,
          notifiers: [bob],
          notifiers_count: 1,
          created_at: at(10, 10),
          updated_at: at(10, 10)
        },
        {
          id: 6,
          key: 'published',
          click_action: `/chapters/${ids.draft}`,
          notifiable: {
            id: ids.draft,
            type: 'chapter',
            image: null,
            image_url: ''
          },
          notifier: carol,
          read: false,
          notifiers: [carol],
          notifiers_count: 1,
          created_at: at(10, 6),
          updated_at: at(10, 6)
        },
        {
          id: 5,
          key: 'liked',
          click_action: `/pins/${ids.shoyu}`,
          notifiable: {
            id: ids.pinComment,
            type: 'comment',
            image: variants('shoyu'),
            image_url: `${IMAGE_BASE}/shoyu/public`
          },
          notifier: carol,
          read: false,
          notifiers: [carol],
          notifiers_count: 1,
          created_at: at(10, 5),
          updated_at: at(10, 5)
        },
        {
          id: 4,
          key: 'comment',
          click_action: `/pins/${ids.shoyu}`,
          notifiable: {
            id: ids.shoyu,
            type: 'pin',
            image: variants('shoyu'),
            image_url: `${IMAGE_BASE}/shoyu/public`
          },
          notifier: bob,
          read: true,
          notifiers: [bob],
          notifiers_count: 1,
          created_at: at(10, 4),
          updated_at: at(10, 4)
        },
        {
          id: 3,
          key: 'liked',
          click_action: `/pins/${ids.shoyu}`,
          notifiable: {
            id: ids.shoyu,
            type: 'pin',
            image: variants('shoyu'),
            image_url: `${IMAGE_BASE}/shoyu/public`
          },
          notifier: bob,
          read: false,
          notifiers: [bob, carol],
          notifiers_count: 2,
          created_at: at(10, 3),
          updated_at: at(10, 3)
        }
      ],
      next_cursor: null
    });
  });

  it('pages by the latest id and keeps unread groups only on read=false', async () => {
    expect(await idsOf('/v2/me/notifications?cursor=6', 'alice')).toEqual([
      5, 4, 3
    ]);
    expect(await idsOf('/v2/me/notifications?read=false', 'alice')).toEqual([
      10, 6, 5, 3
    ]);
    expect(await idsOf('/v2/me/notifications?read=true', 'alice')).toEqual([
      10, 6, 5, 4, 3
    ]);
  });

  it('reads the first of repeated parameters and ignores unknown keys', async () => {
    expect(
      await idsOf('/v2/me/notifications?cursor=6&cursor=4', 'alice')
    ).toEqual([5, 4, 3]);
    expect(
      await idsOf('/v2/me/notifications?read=false&read=true', 'alice')
    ).toEqual([10, 6, 5, 3]);
    expect(
      await idsOf('/v2/me/notifications?read=true&read=false', 'alice')
    ).toEqual([10, 6, 5, 4, 3]);
    expect(await idsOf('/v2/me/notifications?other=6', 'alice')).toEqual([
      10, 6, 5, 4, 3
    ]);
  });

  it('reads only the false spellings as unread', async () => {
    for (const read of ['0', 'f', 'F', 'false', 'FALSE', 'off', 'OFF']) {
      expect(await idsOf(`/v2/me/notifications?read=${read}`, 'alice')).toEqual(
        [10, 6, 5, 3]
      );
    }
    for (const read of ['', 'False', 'no', 'Off']) {
      expect(await idsOf(`/v2/me/notifications?read=${read}`, 'alice')).toEqual(
        [10, 6, 5, 4, 3]
      );
    }
  });

  it('pages from the start on a blank cursor and to nothing on an invalid one', async () => {
    for (const cursor of ['', '%20']) {
      expect(
        await idsOf(`/v2/me/notifications?cursor=${cursor}`, 'alice')
      ).toEqual([10, 6, 5, 4, 3]);
    }
    for (const cursor of ['abc', '0', '-1', '1.5']) {
      expect(
        await get(`/v2/me/notifications?cursor=${cursor}`, 'alice')
      ).toEqual({ status: 200, body: { data: [], next_cursor: null } });
    }
  });
});

describe('GET /v2/me/pins', () => {
  it('reads the first of repeated cursors and rejects a malformed one', async () => {
    const first = await get('/v2/me/pins', 'alice');

    expect(first.status).toBe(200);
    for (const query of ['?cursor=', '?cursor=&cursor=%25', '?other=%25']) {
      expect(await get(`/v2/me/pins${query}`, 'alice')).toEqual(first);
    }
    for (const query of ['?cursor=%25', '?cursor=%25&cursor=']) {
      expect((await get(`/v2/me/pins${query}`, 'alice')).status).toBe(400);
    }
  });
});

describe('blocked and muted accounts', () => {
  it('lists the accounts under an active block or mute', async () => {
    expect(await get('/v2/me/blocks', 'alice')).toEqual({
      status: 200,
      body: {
        data: [
          {
            id: dave,
            name: 'Dave',
            biography: null,
            image: null,
            image_url: ''
          }
        ],
        next_cursor: null
      }
    });
    expect(await get('/v2/me/mutes', 'carol')).toEqual({
      status: 200,
      body: {
        data: [{ ...bob, biography: null }],
        next_cursor: null
      }
    });
    expect(await idsOf('/v2/me/blocks?cursor=1', 'alice')).toEqual([]);
    expect(await idsOf('/v2/me/blocks?cursor=abc', 'alice')).toEqual([]);
  });

  it('reads the first of repeated cursors and starts over on a blank one', async () => {
    expect(await idsOf('/v2/me/blocks?cursor=', 'alice')).toEqual([dave]);
    expect(await idsOf('/v2/me/blocks?cursor=%20', 'alice')).toEqual([dave]);
    expect(await idsOf('/v2/me/blocks?cursor=&cursor=1', 'alice')).toEqual([
      dave
    ]);
    expect(await idsOf('/v2/me/blocks?cursor=abc&cursor=', 'alice')).toEqual(
      []
    );
    expect(await idsOf('/v2/me/mutes?cursor=&cursor=1', 'carol')).toEqual([
      ids.bob
    ]);
    expect(await idsOf('/v2/me/mutes?cursor=1&cursor=', 'carol')).toEqual([]);
  });
});
