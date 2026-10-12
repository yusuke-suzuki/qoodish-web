import { env } from 'cloudflare:test';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { database } from './db/client.ts';
import { chapters, maps } from './db/schema.ts';
import { get, idsOf } from './test/client.ts';
import { variants } from './test/serialized.ts';
import { ids, seedWorld } from './test/world.ts';

beforeAll(async () => {
  await seedWorld(env.DB);
});

describe('search', () => {
  it('matches terms of three or more characters through the index', async () => {
    expect(await idsOf('/guest/maps?input=ramen')).toEqual([ids.ramen]);
    expect(await idsOf('/guest/maps?input=Tokyo%20Ramen')).toEqual([ids.ramen]);
  });

  it('matches two-character terms by substring, ignoring ASCII case', async () => {
    expect(await idsOf('/guest/maps?input=ca')).toEqual([ids.cafe]);
    expect(await idsOf('/guest/maps?input=KY')).toEqual([ids.cafe, ids.ramen]);
  });

  it('requires every term to match', async () => {
    expect(await idsOf('/guest/maps?input=Tokyo%20Cafe')).toEqual([]);
  });

  it('finds nothing when no term is long enough for the full-text index', async () => {
    expect(await idsOf('/guest/maps?input=a')).toEqual([]);
  });

  it('treats LIKE wildcards in a term as text', async () => {
    expect(await idsOf('/guest/maps?input=%25%25')).toEqual([]);
  });

  it('searches pins and chapters', async () => {
    expect(await idsOf('/guest/pins?input=shoyu')).toEqual([ids.shoyu]);
    expect(await get('/guest/chapters?input=noodles')).toEqual({
      status: 200,
      body: [
        {
          id: ids.cafeStory,
          title: 'Cafe Story',
          image: null,
          map: { id: ids.cafe, name: 'Kyoto Cafe' }
        },
        {
          id: ids.noodleStory,
          title: 'Noodle Story',
          image: variants('story'),
          map: { id: ids.ramen, name: 'Tokyo Ramen' }
        }
      ]
    });
    expect(await idsOf('/guest/chapters?input=noodle%20cafe')).toEqual([
      ids.cafeStory
    ]);
  });
});

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

    expect(await idsOf('/guest/chapters?input=dumplings')).toEqual([
      ids.noodleStory
    ]);
    expect(await idsOf('/guest/chapters?input=river')).not.toContain(
      ids.noodleStory
    );
    expect(await idsOf('/guest/chapters?input=at')).toContain(ids.noodleStory);
  });

  it('ignores diacritics in terms looked up through the index', async () => {
    await database(env.DB)
      .update(maps)
      .set({ name: 'Crème Café' })
      .where(eq(maps.id, ids.cafe));

    expect(await idsOf('/guest/maps?input=creme')).toEqual([ids.cafe]);
  });
});
