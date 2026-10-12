import type { GuestPin } from '@qoodish/api-contract';
import { and, asc, count, desc, eq, getTableColumns } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../app.ts';
import { pins, votes } from '../../db/schema.ts';
import { ApiError } from '../../errors.ts';
import { guestPins } from '../../pins.ts';
import { first } from '../../routing.ts';
import { SEARCH_LIMIT, searchCondition } from '../../search.ts';
import {
  flag,
  id,
  pathParams,
  queryParams,
  searchInput
} from '../../validation.ts';
import { publicPin } from '../../visibility.ts';

const RECENT_PINS_LIMIT = 8;
const POPULAR_PINS_LIMIT = 10;

const listingQuery = queryParams(
  z.object({ input: searchInput, recent: flag, popular: flag })
);

const app = new Hono<AppEnv>();

app.get('/', listingQuery, async (c) => {
  const db = c.get('db');
  const { input, recent, popular } = c.req.valid('query');

  if (input !== undefined) {
    const matched = searchCondition(input, {
      index: 'pins_fts',
      id: pins.id,
      columns: ['name', 'comment']
    });

    if (!matched) {
      return c.json<GuestPin[]>([]);
    }

    return c.json<GuestPin[]>(
      await guestPins(
        db,
        await db
          .select()
          .from(pins)
          .where(and(publicPin(), matched))
          .orderBy(desc(pins.createdAt), desc(pins.id))
          .limit(SEARCH_LIMIT)
      )
    );
  }

  if (recent) {
    return c.json<GuestPin[]>(
      await guestPins(
        db,
        await db
          .select()
          .from(pins)
          .where(publicPin())
          .orderBy(desc(pins.createdAt), asc(pins.id))
          .limit(RECENT_PINS_LIMIT)
      )
    );
  }

  if (popular) {
    return c.json<GuestPin[]>(
      await guestPins(
        db,
        await db
          .select(getTableColumns(pins))
          .from(pins)
          .innerJoin(
            votes,
            and(eq(votes.votableType, 'Pin'), eq(votes.votableId, pins.id))
          )
          .where(publicPin())
          .groupBy(pins.id)
          .orderBy(desc(count(votes.id)), asc(pins.id))
          .limit(POPULAR_PINS_LIMIT)
      )
    );
  }

  throw new ApiError('BadRequest');
});

app.get('/:id', pathParams(z.object({ id })), async (c) => {
  const db = c.get('db');
  const pin = first(
    await db
      .select()
      .from(pins)
      .where(and(publicPin(), eq(pins.id, c.req.valid('param').id)))
  );

  return c.json<GuestPin>(first(await guestPins(db, [pin])));
});

export default app;
