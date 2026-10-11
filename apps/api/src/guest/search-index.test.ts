import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.ts';
import { database } from '../db/client.ts';
import { chapters, maps } from '../db/schema.ts';
import { ids, seedWorld } from '../test/world.ts';

const app = createApp();

beforeAll(async () => {
  await seedWorld(env.DB);
});

async function ids_of(path: string): Promise<number[]> {
  const res = await app.request(path, {}, env);

  expect(res.status).toBe(200);
  return ((await res.json()) as { id: number }[]).map((item) => item.id);
}

describe('search indexes', () => {
  it('reindexes the text of a chapter when its content changes', async () => {
    await database(env.DB)
      .update(chapters)
      .set({
        content: JSON.stringify({
          root: {
            children: [{ children: [{ text: 'Dumplings at dawn' }] }],
            type: 'root'
          }
        })
      })
      .where(eq(chapters.id, ids.noodleStory));

    expect(await ids_of('/guest/chapters?input=dumplings')).toEqual([
      ids.noodleStory
    ]);
    expect(await ids_of('/guest/chapters?input=river')).not.toContain(
      ids.noodleStory
    );
    expect(await ids_of('/guest/chapters?input=at')).toContain(ids.noodleStory);
  });

  it('ignores diacritics in terms looked up through the index', async () => {
    await database(env.DB)
      .update(maps)
      .set({ name: 'Crème Café' })
      .where(eq(maps.id, ids.cafe));

    expect(await ids_of('/guest/maps?input=creme')).toEqual([ids.cafe]);
  });
});
