import type {
  ApiCursorPage,
  ModeratedAccount,
  NotificationGroup,
  Pin
} from '@qoodish/api-contract';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { blockedAccounts, mutedAccounts } from '../../accounts.ts';
import { FEED_PER_PAGE, nextCursor } from '../../cursor.ts';
import { database } from '../../db/client.ts';
import { pins } from '../../db/schema.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../../middleware/authenticate-user.ts';
import { notificationGroups } from '../../notifications.ts';
import { viewerPins } from '../../pins.ts';
import { feedPage, present } from '../../routing.ts';
import { optionalId } from '../../validation.ts';
import { visible } from '../../visibility.ts';

const FALSE_PARAMS = new Set(['0', 'f', 'F', 'false', 'FALSE', 'off', 'OFF']);

function pageCursor(param: string | undefined): number | null {
  return present(param) ? (optionalId(param) ?? 0) : null;
}

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.get('/notifications', async (c) => {
  const read = c.req.query('read');

  return c.json<ApiCursorPage<NotificationGroup>>(
    await notificationGroups(database(c.env.DB), c.get('viewer'), {
      cursor: pageCursor(c.req.query('cursor')),
      unread: read !== undefined && FALSE_PARAMS.has(read)
    })
  );
});

app.get('/pins', async (c) => {
  const db = database(c.env.DB);
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(pins)
    .where(
      feedPage(
        c.req.query('cursor'),
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

app.get('/blocks', async (c) =>
  c.json<ApiCursorPage<ModeratedAccount>>(
    await blockedAccounts(
      database(c.env.DB),
      c.get('viewer').id,
      pageCursor(c.req.query('cursor'))
    )
  )
);

app.get('/mutes', async (c) =>
  c.json<ApiCursorPage<ModeratedAccount>>(
    await mutedAccounts(
      database(c.env.DB),
      c.get('viewer').id,
      pageCursor(c.req.query('cursor'))
    )
  )
);

export default app;
