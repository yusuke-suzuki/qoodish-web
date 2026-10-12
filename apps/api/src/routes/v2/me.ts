import type {
  ApiCursorPage,
  ModeratedAccount,
  NotificationGroup,
  Pin
} from '@qoodish/api-contract';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { blockedAccounts, mutedAccounts } from '../../accounts.ts';
import { FEED_PER_PAGE, nextCursor } from '../../cursor.ts';
import { pins } from '../../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../../middleware/authenticate-user.ts';
import { notificationGroups } from '../../notifications.ts';
import { viewerPins } from '../../pins.ts';
import { feedPage, present } from '../../routing.ts';
import { feedCursor, optionalId, queryParams } from '../../validation.ts';
import { visible } from '../../visibility.ts';

const FALSE_PARAMS = new Set(['0', 'f', 'F', 'false', 'FALSE', 'off', 'OFF']);

const pageCursor = z
  .string()
  .optional()
  .transform((param) => (present(param) ? (optionalId(param) ?? 0) : null));

const pageQuery = queryParams(z.object({ cursor: pageCursor }));

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get(
  '/notifications',
  queryParams(
    z.object({
      cursor: pageCursor,
      read: z
        .string()
        .optional()
        .transform((read) => read !== undefined && FALSE_PARAMS.has(read))
    })
  ),
  async (c) => {
    const { cursor, read: unread } = c.req.valid('query');

    return c.json<ApiCursorPage<NotificationGroup>>(
      await notificationGroups(c.get('db'), c.get('viewer'), {
        cursor,
        unread
      })
    );
  }
);

app.get('/pins', queryParams(z.object({ cursor: feedCursor })), async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.valid('query').cursor,
        pins.createdAt,
        pins.id,
        and(
          eq(pins.userId, viewer.id),
          eq(pins.status, 'published'),
          visible(pins.id, 'Pin')
        )
      )
    )
    .orderBy(desc(pins.createdAt), desc(pins.id))
    .limit(FEED_PER_PAGE);

  return c.json<ApiCursorPage<Pin>>({
    data: await viewerPins(db, viewer, rows),
    next_cursor: nextCursor(rows)
  });
});

app.get('/blocks', pageQuery, async (c) =>
  c.json<ApiCursorPage<ModeratedAccount>>(
    await blockedAccounts(
      c.get('db'),
      c.get('viewer').id,
      c.req.valid('query').cursor
    )
  )
);

app.get('/mutes', pageQuery, async (c) =>
  c.json<ApiCursorPage<ModeratedAccount>>(
    await mutedAccounts(
      c.get('db'),
      c.get('viewer').id,
      c.req.valid('query').cursor
    )
  )
);

export default app;
