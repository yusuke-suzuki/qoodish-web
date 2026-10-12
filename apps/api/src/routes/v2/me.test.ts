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
});
