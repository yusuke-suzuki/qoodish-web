import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { inviteCoauthor } from '../coauthorship-invitations.ts';
import { database } from '../db/client.ts';
import {
  blocks,
  coauthorshipInvitations,
  coauthorships,
  maps,
  notifications
} from '../db/schema.ts';
import type { MapRow } from '../maps.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { at, ids, seedWorld } from '../test/world.ts';

let signer: Signer;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  signer = await createSigner();
  app = createApp({ firebaseKeys: signer.keys });
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

async function send(method: string, path: string, uid: string, body?: unknown) {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, { sub: uid })
  );
  const res = await app.request(
    path,
    {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    },
    env
  );
  const text = await res.text();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

function invite(mapId: number, uid: string, userId: number) {
  return send('POST', `/maps/${mapId}/coauthorship_invitations`, uid, {
    user_id: userId
  });
}

async function coauthorsOf(mapId: number) {
  const rows = await db()
    .select({ userId: coauthorships.userId })
    .from(coauthorships)
    .where(eq(coauthorships.mapId, mapId));

  return rows.map((row) => row.userId);
}

describe('POST /maps/:mapId/coauthorship_invitations', () => {
  it('invites a user and notifies them', async () => {
    const { status, body } = await invite(ids.ramen, 'alice', ids.bob);
    const invited = await db()
      .select({
        notifierId: notifications.notifierId,
        recipientId: notifications.recipientId
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.key, 'coauthor_invited'),
          eq(notifications.notifiableType, 'Map'),
          eq(notifications.notifiableId, ids.ramen)
        )
      );

    expect(status).toBe(200);
    expect(body).toMatchObject({
      map: { id: ids.ramen, name: 'Tokyo Ramen' },
      inviter: { id: ids.alice },
      status: 'pending'
    });
    expect(invited).toEqual([{ notifierId: ids.alice, recipientId: ids.bob }]);
  });

  it('answers 422 for a pending invitation, the author or a coauthor', async () => {
    const pending = await invite(ids.ramen, 'carol', ids.bob);
    const author = await invite(ids.ramen, 'carol', ids.alice);
    const coauthor = await invite(ids.ramen, 'alice', ids.carol);

    expect(pending).toMatchObject({
      status: 422,
      body: { detail: 'A pending invitation already exists for this user.' }
    });
    expect(author.body.detail).toBe(
      'The author cannot be invited as a coauthor.'
    );
    expect(coauthor.body.detail).toBe('The user is already a coauthor.');
  });

  it('answers 404 for an unknown user or a map the user cannot edit', async () => {
    expect((await invite(ids.ramen, 'alice', 999)).status).toBe(404);
    expect((await invite(ids.cafe, 'carol', ids.alice)).status).toBe(404);
  });

  it('answers 404 without a user id and 400 for one of the wrong type', async () => {
    const path = `/maps/${ids.ramen}/coauthorship_invitations`;

    expect((await send('POST', path, 'alice', {})).status).toBe(404);
    expect((await send('POST', path, 'alice', { user_id: 'x' })).status).toBe(
      404
    );
    expect((await send('POST', path, 'alice', { user_id: true })).status).toBe(
      400
    );
  });
});

describe('POST /me/coauthorship_invitations/:id/accept and /decline', () => {
  it('makes the invitee a coauthor once accepted', async () => {
    const [pending] = (await send('GET', '/me/coauthorship_invitations', 'bob'))
      .body;
    const accepted = await send(
      'POST',
      `/me/coauthorship_invitations/${pending.id}/accept`,
      'bob'
    );
    const again = await send(
      'POST',
      `/me/coauthorship_invitations/${pending.id}/accept`,
      'bob'
    );

    expect(accepted).toMatchObject({
      status: 200,
      body: { id: pending.id, status: 'accepted' }
    });
    const declinedAfter = await send(
      'POST',
      `/me/coauthorship_invitations/${pending.id}/decline`,
      'bob'
    );

    expect(again.status).toBe(404);
    expect(declinedAfter.status).toBe(404);
    expect(
      (await send('GET', `/me/coauthorship_invitations`, 'bob')).body
    ).toEqual([]);
    expect(await coauthorsOf(ids.ramen)).toEqual(
      expect.arrayContaining([ids.bob, ids.carol])
    );
  });

  it('leaves the map as it was once declined', async () => {
    const invited = await invite(ids.cafe, 'bob', ids.alice);
    const declined = await send(
      'POST',
      `/me/coauthorship_invitations/${invited.body.id}/decline`,
      'alice'
    );
    const byOther = await send(
      'POST',
      `/me/coauthorship_invitations/${invited.body.id}/accept`,
      'carol'
    );

    expect(declined.body).toMatchObject({ status: 'declined' });
    expect(byOther.status).toBe(404);
    expect(await coauthorsOf(ids.cafe)).toEqual([]);
  });
});

describe('invitations across a block', () => {
  it('answers 422 when the inviter blocks the invitee', async () => {
    await db()
      .insert(blocks)
      .values({ blockerId: ids.bob, blockedId: ids.alice, createdAt: at(30) });

    expect(await invite(ids.cafe, 'bob', ids.alice)).toMatchObject({
      status: 422,
      body: {
        detail:
          "You cannot invite an account as a coauthor when you or the map's author has blocked it or been blocked by it."
      }
    });
  });

  it('answers 422 when the map author blocks the invitee a coauthor invites', async () => {
    await db()
      .insert(coauthorships)
      .values({
        mapId: ids.cafe,
        userId: ids.carol,
        createdAt: at(30),
        updatedAt: at(30)
      });

    expect((await invite(ids.cafe, 'carol', ids.alice)).status).toBe(422);
  });
});

describe('invitations refused at the time of writing', () => {
  it('answers 404 and records nothing once the inviter can no longer edit the map', async () => {
    const [map] = await db().select().from(maps).where(eq(maps.id, ids.secret));
    const before = await db().select().from(coauthorshipInvitations);

    await expect(
      inviteCoauthor(
        db(),
        {
          id: ids.bob,
          blocking: new Set(),
          blockedBy: new Set(),
          muting: new Set()
        },
        { map: map as MapRow, inviteeId: ids.carol }
      )
    ).rejects.toMatchObject({ status: 404 });
    expect(await db().select().from(coauthorshipInvitations)).toEqual(before);
  });

  it('answers 422 when the invitee blocks the inviter', async () => {
    await db()
      .insert(blocks)
      .values({ blockerId: ids.bob, blockedId: ids.carol, createdAt: at(31) });

    expect(await invite(ids.ramen, 'carol', ids.bob)).toMatchObject({
      status: 422
    });
  });
});

describe('answering an unknown invitation', () => {
  it('answers 404 for an unknown invitation or answer', async () => {
    expect(
      (await send('POST', '/me/coauthorship_invitations/999/accept', 'carol'))
        .status
    ).toBe(404);
    expect(
      await send('POST', '/me/coauthorship_invitations/1/maybe', 'bob')
    ).toMatchObject({
      status: 404,
      body: {
        detail: "No route matches [POST] '/me/coauthorship_invitations/1/maybe'"
      }
    });
  });
});
