import { env } from 'cloudflare:test';
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createChapter, reviseChapter } from './chapters.ts';
import { database } from './db/client.ts';
import { blocks, chapters, notifications } from './db/schema.ts';
import { first } from './routing.ts';
import { publishedNotifications } from './test/records.ts';
import {
  at,
  CHAPTER_CONTENT,
  ids,
  MAP_FEATURES,
  seedWorld
} from './test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

const db = () => database(env.DB);

afterEach(() => {
  vi.restoreAllMocks();
});

function draft(userId: number, mapId: number) {
  return createChapter(db(), {
    userId,
    mapId,
    journey: null,
    changes: { title: 'A walk', content: CHAPTER_CONTENT }
  });
}

function revise(
  chapterId: number,
  editorId: number,
  changes: { status?: 'draft' | 'published'; title?: string }
) {
  return reviseChapter(
    db(),
    env.WEB_PUSH_QUEUE,
    async () =>
      first(
        await db().select().from(chapters).where(eq(chapters.id, chapterId))
      ),
    { editorId, changes }
  );
}

async function publishedNotificationIds(chapterId: number) {
  const rows = await db()
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.key, 'published'),
        eq(notifications.notifiableType, 'Chapter'),
        eq(notifications.notifiableId, chapterId)
      )
    );

  return rows.map((row) => row.id);
}

describe('reviseChapter', () => {
  it('notifies the map author when a draft is published and enqueues its web push', async () => {
    const chapterId = await draft(ids.bob, ids.ramen);
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await revise(chapterId, ids.bob, { status: 'published' });

    const [notificationId] = await publishedNotificationIds(chapterId);

    expect(await publishedNotifications(chapterId)).toEqual([
      { notifierId: ids.bob, recipientId: ids.alice }
    ]);
    expect(sendBatch).toHaveBeenCalledExactlyOnceWith([
      { body: { notificationId } }
    ]);
  });

  it('notifies once however often the chapter is published again', async () => {
    const chapterId = await draft(ids.bob, ids.ramen);

    await revise(chapterId, ids.bob, { status: 'published' });
    await revise(chapterId, ids.bob, { status: 'draft' });

    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await revise(chapterId, ids.bob, { status: 'published' });

    expect(await publishedNotifications(chapterId)).toHaveLength(1);
    expect(sendBatch).not.toHaveBeenCalled();
  });

  it('notifies nobody for an edit, an own map or a chapter without a map', async () => {
    const edited = await draft(ids.bob, ids.ramen);
    const own = await draft(ids.alice, ids.ramen);
    const [mapless] = await db()
      .insert(chapters)
      .values({
        userId: ids.bob,
        mapId: null,
        title: 'Mapless',
        status: 'draft',
        content: JSON.stringify(CHAPTER_CONTENT),
        mapFeatures: JSON.stringify(MAP_FEATURES),
        createdAt: at(1),
        updatedAt: at(1)
      })
      .returning({ id: chapters.id });
    const sendBatch = vi.spyOn(env.WEB_PUSH_QUEUE, 'sendBatch');

    await revise(edited, ids.bob, { title: 'Renamed walk' });
    await revise(own, ids.alice, { status: 'published' });
    await revise(mapless.id, ids.bob, { status: 'published' });

    expect(await publishedNotifications(edited)).toEqual([]);
    expect(await publishedNotifications(own)).toEqual([]);
    expect(await publishedNotifications(mapless.id)).toEqual([]);
    expect(sendBatch).not.toHaveBeenCalled();
  });

  it('notifies the map author across a block, which only withholds the web push', async () => {
    const chapterId = await draft(ids.carol, ids.ramen);

    await db()
      .insert(blocks)
      .values({ blockerId: ids.alice, blockedId: ids.carol, createdAt: at(2) });
    await revise(chapterId, ids.carol, { status: 'published' });

    expect(await publishedNotifications(chapterId)).toEqual([
      { notifierId: ids.carol, recipientId: ids.alice }
    ]);
  });

  it('rebuilds the search entry only when the title or content changes', async () => {
    const chapterId = await draft(ids.bob, ids.cafe);
    const searchEntry = () =>
      env.DB.prepare('SELECT title, body FROM chapters_fts WHERE rowid = ?')
        .bind(chapterId)
        .first();

    await env.DB.prepare(
      "UPDATE chapters_fts SET body = 'stale' WHERE rowid = ?"
    )
      .bind(chapterId)
      .run();
    await revise(chapterId, ids.bob, { status: 'published' });

    expect(await searchEntry()).toEqual({ title: 'A walk', body: 'stale' });

    await revise(chapterId, ids.bob, { title: 'A long walk' });

    expect(await searchEntry()).toEqual({
      title: 'A long walk',
      body: 'Noodles by the river'
    });
  });
});
