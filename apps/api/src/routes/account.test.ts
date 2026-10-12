import { env } from 'cloudflare:test';
import { asc, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { database } from '../db/client.ts';
import {
  devices,
  journalRevisions,
  journals,
  mapRevisions,
  maps,
  userPreferences,
  userRevisions,
  users
} from '../db/schema.ts';
import { createSigner, firebaseClaims, type Signer } from '../test/jwt.ts';
import { ids, seedWorld } from '../test/world.ts';

let signer: Signer;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  signer = await createSigner();
  app = createApp({ firebaseKeys: signer.keys });
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

async function send(
  method: string,
  path: string,
  claims: Record<string, unknown>,
  { body, language }: { body?: unknown; language?: string } = {}
) {
  const token = await signer.sign(
    firebaseClaims(env.GOOGLE_PROJECT_ID, claims)
  );
  const res = await app.request(
    path,
    {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(language ? { 'accept-language': language } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    },
    env
  );
  const text = await res.text();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function accountOf(uid: string) {
  const [user] = await db().select().from(users).where(eq(users.uid, uid));

  if (!user) {
    return undefined;
  }

  const [revisions, ownMaps, ownJournals] = await Promise.all([
    db()
      .select()
      .from(userRevisions)
      .where(eq(userRevisions.userId, user.id))
      .orderBy(asc(userRevisions.id)),
    db().select().from(maps).where(eq(maps.userId, user.id)),
    db().select().from(journals).where(eq(journals.userId, user.id))
  ]);

  return { user, revisions, maps: ownMaps, journals: ownJournals };
}

describe('POST /users', () => {
  it('creates the user with a revision, a private map and a journal', async () => {
    const { status, body } = await send(
      'POST',
      '/users',
      { sub: 'eve', name: 'Eve', email: 'eve@example.com' },
      { language: 'ja-JP' }
    );
    const account = await accountOf('eve');

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: account?.user.id,
      uid: 'eve',
      name: 'Eve',
      biography: null,
      image: null,
      image_url: '',
      maps_count: 1,
      bookmarked_maps_count: 0,
      pins_count: 0,
      push_notification: {
        coauthor_invited: true,
        liked: true,
        comment: true,
        published: true
      }
    });
    expect(account?.user).toMatchObject({
      email: 'eve@example.com',
      locale: 'ja',
      currentRevisionId: account?.revisions[0]?.id
    });
    expect(account?.revisions).toMatchObject([
      { name: 'Eve', biography: null }
    ]);

    const [map] = account?.maps ?? [];
    const [mapRevision] = await db()
      .select()
      .from(mapRevisions)
      .where(eq(mapRevisions.mapId, map?.id ?? 0));

    expect(map).toMatchObject({
      name: "Eve's map",
      description: "Eve's map.",
      private: true,
      status: 'published',
      currentRevisionId: mapRevision?.id
    });
    expect(mapRevision).toMatchObject({
      name: "Eve's map",
      private: true,
      userId: account?.user.id
    });

    const [journal] = account?.journals ?? [];
    const [journalRevision] = await db()
      .select()
      .from(journalRevisions)
      .where(eq(journalRevisions.journalId, journal?.id ?? 0));

    expect(journal).toMatchObject({
      title: "Eve's journal",
      currentRevisionId: journalRevision?.id
    });
  });

  it('refreshes the email and locale of an existing user and nothing else', async () => {
    const before = await accountOf('eve');
    const { status, body } = await send('POST', '/users', {
      sub: 'eve',
      name: 'Renamed',
      email: 'eve@example.org'
    });
    const after = await accountOf('eve');

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: before?.user.id, name: 'Eve' });
    expect(after?.user).toMatchObject({
      email: 'eve@example.org',
      locale: 'en'
    });
    expect(after?.revisions).toHaveLength(1);
    expect(after?.maps).toHaveLength(1);
  });

  it('truncates the default map name to fit a long display name', async () => {
    const name = 'Bartholomew Montgomery-Fitzgerald';
    const { status } = await send('POST', '/users', { sub: 'long', name });
    const account = await accountOf('long');

    expect(status).toBe(200);
    expect(account?.maps[0]?.name).toBe('Bartholomew Montgomery-Fitz...');
    expect(account?.journals[0]?.title).toBe(`${name}'s journal`);
  });

  it('answers 422 and creates nothing without a name', async () => {
    const { status, body } = await send('POST', '/users', {
      sub: 'nameless',
      name: undefined
    });

    expect(status).toBe(422);
    expect(body).toEqual({
      title: 'UnprocessableContent',
      detail: 'Name is required.'
    });
    expect(await accountOf('nameless')).toBeUndefined();
  });
});

describe('PUT /me/profile', () => {
  it('appends a revision only when the name or biography changes', async () => {
    const changed = await send(
      'PUT',
      '/me/profile',
      { sub: 'eve' },
      {
        body: { name: 'Eve Online', biography: 'Wanderer' }
      }
    );
    const unchanged = await send(
      'PATCH',
      '/me/profile',
      { sub: 'eve' },
      {
        body: { name: 'Eve Online' }
      }
    );
    const account = await accountOf('eve');

    expect(changed).toMatchObject({
      status: 200,
      body: { name: 'Eve Online', biography: 'Wanderer' }
    });
    expect(unchanged.status).toBe(200);
    expect(
      account?.revisions.map(({ name, biography }) => [name, biography])
    ).toEqual([
      ['Eve', null],
      ['Eve Online', 'Wanderer']
    ]);
    expect(account?.user.currentRevisionId).toBe(account?.revisions[1]?.id);
  });

  it('sets the avatar from the first image id and clears it with an empty list', async () => {
    const set = await send(
      'PUT',
      '/me/profile',
      { sub: 'alice' },
      {
        body: { image_ids: [ids.aliceImage] }
      }
    );
    const cleared = await send(
      'PUT',
      '/me/profile',
      { sub: 'alice' },
      {
        body: { image_ids: [] }
      }
    );

    expect(set.body.image_url).toMatch(/alice\/public$/);
    expect(cleared.body).toMatchObject({ image: null, image_url: '' });
    expect((await accountOf('alice'))?.revisions).toHaveLength(0);
  });

  it('refuses a blank name', async () => {
    const { status, body } = await send(
      'PUT',
      '/me/profile',
      { sub: 'bob' },
      { body: { name: ' ' }, language: 'ja' }
    );

    expect(status).toBe(422);
    expect(body.detail).toBe('名前を入力してください。');
  });

  it('refuses an image someone else uploaded', async () => {
    const { status, body } = await send(
      'PUT',
      '/me/profile',
      { sub: 'bob' },
      { body: { image_ids: [ids.aliceImage] }, language: 'ja' }
    );

    expect(status).toBe(422);
    expect(body.detail).toBe('ご自身でアップロードした画像ではありません。');
  });

  it('answers 400 for image ids that are not a list of plain ids', async () => {
    for (const imageIds of ['all', [0], [-1], [''], ['0x10']]) {
      const { status } = await send(
        'PUT',
        '/me/profile',
        { sub: 'bob' },
        { body: { image_ids: imageIds } }
      );

      expect(status).toBe(400);
    }
  });

  it('answers 401 for a token without a user', async () => {
    const { status } = await send(
      'PUT',
      '/me/profile',
      { sub: 'stranger' },
      {
        body: { name: 'Stranger' }
      }
    );

    expect(status).toBe(401);
  });
});

describe('PUT /me/journal', () => {
  it('revises the journal and answers it', async () => {
    const { status, body } = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      {
        body: { title: 'Field notes', description: 'Places I walked' }
      }
    );
    const [journal] = (await accountOf('eve'))?.journals ?? [];
    const revisions = await db()
      .select()
      .from(journalRevisions)
      .where(eq(journalRevisions.journalId, journal?.id ?? 0));

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: journal?.id,
      title: 'Field notes',
      description: 'Places I walked',
      editable: true
    });
    expect(revisions).toHaveLength(2);
    expect(journal?.currentRevisionId).toBe(revisions[1]?.id);
  });

  it('answers 422 for a blank or long title', async () => {
    const blank = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      {
        body: { title: '' }
      }
    );
    const long = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      {
        body: { title: 'x'.repeat(51) }
      }
    );

    expect(blank.body.detail).toBe('Journal title is required.');
    expect(long.body.detail).toBe('Journal title is too long. (Max: 50)');
  });

  it('answers only the required message for a long blank title', async () => {
    const { body } = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      { body: { title: ' '.repeat(51) } }
    );

    expect(body.detail).toBe('Journal title is required.');
  });

  it('keeps carriage returns in the description', async () => {
    const { body } = await send(
      'PUT',
      '/me/journal',
      { sub: 'eve' },
      { body: { description: 'First\r\nSecond' } }
    );

    expect(body.description).toBe('First\r\nSecond');
  });
});

describe('PUT /me/preferences', () => {
  it('appends a snapshot that keeps the choices it was not sent', async () => {
    await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      {
        body: { web_push: { liked: false } }
      }
    );
    const { status, body } = await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      {
        body: { web_push: { comment: false, retired: false } }
      }
    );
    const rows = await db()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ids.bob));

    expect(status).toBe(200);
    expect(body).toEqual({
      web_push: {
        coauthor_invited: true,
        liked: false,
        comment: false,
        published: true
      }
    });
    expect(rows).toHaveLength(2);
  });

  it('appends nothing when the choices stay the same and ignores other keys', async () => {
    const before = await db()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ids.bob));
    const { status, body } = await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      { body: { web_push: { liked: false, constructor: true } } }
    );
    const after = await db()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ids.bob));

    expect(status).toBe(200);
    expect(Object.keys(body.web_push)).toEqual([
      'coauthor_invited',
      'liked',
      'comment',
      'published'
    ]);
    expect(after).toHaveLength(before.length);
  });

  it('answers 422 for a choice that is not a boolean and 400 without choices', async () => {
    const invalid = await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      {
        body: { web_push: { liked: 'no' } }
      }
    );
    const missing = await send(
      'PUT',
      '/me/preferences',
      { sub: 'bob' },
      {
        body: {}
      }
    );

    expect(invalid.status).toBe(422);
    expect(missing.status).toBe(400);
  });

  it('ignores a choice it does not know', async () => {
    expect(
      (
        await send(
          'PUT',
          '/me/preferences',
          { sub: 'bob' },
          { body: { web_push: { followed: true } } }
        )
      ).status
    ).toBe(200);
  });
});

describe('/me/devices/:token', () => {
  it('registers a token once and forgets it', async () => {
    const tokens = async () =>
      (
        await db()
          .select({ token: devices.registrationToken })
          .from(devices)
          .where(eq(devices.userId, ids.bob))
      ).map(({ token }) => token);

    expect(
      (await send('PUT', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(
      (await send('PUT', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(await tokens()).toEqual(['a/b']);

    expect(
      (await send('DELETE', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(
      (await send('DELETE', '/me/devices/a%2Fb', { sub: 'bob' })).status
    ).toBe(204);
    expect(await tokens()).toEqual([]);
  });

  it('answers 400 for a token that is too long', async () => {
    expect(
      (await send('PUT', `/me/devices/${'a'.repeat(4097)}`, { sub: 'bob' }))
        .status
    ).toBe(400);
  });
});
