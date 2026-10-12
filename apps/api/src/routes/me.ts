import type {
  AppMap,
  Chapter,
  ChapterDetail,
  CoauthorshipInvitation,
  Journal,
  Journey,
  JourneyCheckin,
  JourneySummary,
  Milestone,
  Notification,
  Pin,
  Profile,
  WebPushPreferences
} from '@qoodish/api-contract';
import { and, asc, desc, eq, inArray, ne, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  preferencesInput,
  profile,
  registerDevice,
  unregisterDevice,
  updateWebPush
} from '../accounts.ts';
import {
  chapterInput,
  discardChapter,
  reviseChapter,
  viewerChapterDetails,
  viewerChapters
} from '../chapters.ts';
import {
  answerInvitation,
  invitation,
  pendingInvitations
} from '../coauthorship-invitations.ts';
import type { Database } from '../db/client.ts';
import {
  chapters,
  journalBookmarks,
  journals,
  maps,
  pins
} from '../db/schema.ts';
import { encryptionSecrets } from '../encryption.ts';
import type { Env } from '../env.ts';
import { journalInput, reviseJournal, viewerJournals } from '../journals.ts';
import {
  addMilestone,
  checkinInput,
  destroyJourney,
  discardCheckin,
  finishInput,
  finishJourney,
  type JourneyOwner,
  journeyCheckin,
  journeyDetail,
  journeySummaries,
  milestoneInput,
  newCheckinInput,
  ownedJourney,
  ownJourney,
  recordCheckin,
  recordedCheckin,
  removeMilestone,
  reviseCheckin,
  startJourney
} from '../journeys.ts';
import { viewerMaps } from '../maps.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import { readNotification } from '../notifications.ts';
import { discardPin, pinInput, revisePin, viewerPins } from '../pins.ts';
import { first } from '../routing.ts';
import { profileInput, updateProfile } from '../users.ts';
import { id, jsonBody, pathParams } from '../validation.ts';
import {
  bookmarkedBy,
  publicMap,
  type Viewer,
  visible
} from '../visibility.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

const REGISTRATION_TOKEN_LIMIT = 4096;

const idParams = pathParams(z.object({ id }));

const deviceParams = pathParams(
  z.object({ token: z.string().min(1).max(REGISTRATION_TOKEN_LIMIT) }),
  'BadRequest'
);

async function ownJournal(db: Database, viewer: Viewer): Promise<Journal> {
  return first(
    await viewerJournals(db, viewer, eq(journals.userId, viewer.id))
  );
}

app.get('/profile', async (c) =>
  c.json<Profile>(await profile(c.get('db'), c.get('viewer').id))
);

app.on(['PUT', 'PATCH'], '/profile', jsonBody(profileInput), async (c) => {
  const db = c.get('db');
  const userId = c.get('viewer').id;

  await updateProfile(db, userId, c.req.valid('json'));

  return c.json<Profile>(await profile(db, userId));
});

app.get('/journal', async (c) =>
  c.json<Journal>(await ownJournal(c.get('db'), c.get('viewer')))
);

app.on(['PUT', 'PATCH'], '/journal', jsonBody(journalInput), async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');

  await reviseJournal(db, viewer.id, c.req.valid('json'));

  return c.json<Journal>(await ownJournal(db, viewer));
});

app.on(
  ['PUT', 'PATCH'],
  '/preferences',
  jsonBody(preferencesInput),
  async (c) =>
    c.json<{ web_push: WebPushPreferences }>({
      web_push: await updateWebPush(
        c.get('db'),
        c.get('viewer').id,
        c.req.valid('json').web_push
      )
    })
);

app.on(['PUT', 'PATCH'], '/devices/:token', deviceParams, async (c) => {
  await registerDevice(
    c.get('db'),
    c.get('viewer').id,
    c.req.valid('param').token
  );

  return c.body(null, 204);
});

app.delete('/devices/:token', deviceParams, async (c) => {
  await unregisterDevice(
    c.get('db'),
    c.get('viewer').id,
    c.req.valid('param').token
  );

  return c.body(null, 204);
});

app.on(['PUT', 'PATCH'], '/notifications/:id', idParams, async (c) =>
  c.json<Notification>(
    await readNotification(
      c.get('db'),
      c.get('viewer'),
      c.req.valid('param').id
    )
  )
);

async function ownPin(db: Database, viewer: Viewer, pinId: number) {
  return first(
    await db
      .select()
      .from(pins)
      .where(
        and(
          eq(pins.id, pinId),
          eq(pins.userId, viewer.id),
          eq(pins.status, 'published')
        )
      )
  );
}

app.on(
  ['PUT', 'PATCH'],
  '/pins/:id',
  idParams,
  jsonBody(pinInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const pinId = c.req.valid('param').id;

    await revisePin(db, () => ownPin(db, viewer, pinId), {
      editorId: viewer.id,
      changes: c.req.valid('json')
    });

    const revised = first(
      await db.select().from(pins).where(eq(pins.id, pinId))
    );

    return c.json<Pin>(first(await viewerPins(db, viewer, [revised])));
  }
);

app.delete('/pins/:id', idParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');

  const pinId = c.req.valid('param').id;

  await discardPin(db, () => ownPin(db, viewer, pinId), viewer.id);

  return c.body(null, 204);
});

app.get('/maps', async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(maps)
    .where(
      and(
        eq(maps.userId, viewer.id),
        eq(maps.status, 'published'),
        visible(maps.id, 'Map')
      )
    )
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

function ownChapters(userId: number): SQL | undefined {
  return and(eq(chapters.userId, userId), ne(chapters.status, 'deleted'));
}

app.get('/chapters', async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(chapters)
    .where(ownChapters(viewer.id))
    .orderBy(desc(chapters.createdAt), asc(chapters.id));

  return c.json<Chapter[]>(await viewerChapters(db, viewer, rows));
});

app.get('/chapters/:id', idParams, async (c) => {
  const viewer = c.get('viewer');

  return c.json<ChapterDetail>(
    first(
      await viewerChapterDetails(
        c.get('db'),
        viewer,
        and(ownChapters(viewer.id), eq(chapters.id, c.req.valid('param').id))
      )
    )
  );
});

async function ownChapter(db: Database, viewer: Viewer, chapterId: number) {
  return first(
    await db
      .select()
      .from(chapters)
      .where(and(ownChapters(viewer.id), eq(chapters.id, chapterId)))
  );
}

app.on(
  ['PUT', 'PATCH'],
  '/chapters/:id',
  idParams,
  jsonBody(chapterInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const chapterId = c.req.valid('param').id;

    await reviseChapter(
      db,
      c.env.WEB_PUSH_QUEUE,
      () => ownChapter(db, viewer, chapterId),
      { editorId: viewer.id, changes: c.req.valid('json') }
    );

    return c.json<ChapterDetail>(
      first(
        await viewerChapterDetails(
          db,
          viewer,
          and(eq(chapters.userId, viewer.id), eq(chapters.id, chapterId))
        )
      )
    );
  }
);

app.delete('/chapters/:id', idParams, async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const chapterId = c.req.valid('param').id;

  await discardChapter(db, () => ownChapter(db, viewer, chapterId), viewer.id);

  return c.body(null, 204);
});

app.get('/coauthorship_invitations', async (c) =>
  c.json<CoauthorshipInvitation[]>(
    await pendingInvitations(c.get('db'), c.get('viewer').id)
  )
);

app.post(
  '/coauthorship_invitations/:id/:answer{accept|decline}',
  pathParams(z.object({ id, answer: z.enum(['accept', 'decline']) })),
  async (c) => {
    const db = c.get('db');
    const { id: invitationId, answer } = c.req.valid('param');

    await answerInvitation(
      db,
      { inviteeId: c.get('viewer').id, id: invitationId },
      answer === 'accept' ? 'accepted' : 'declined'
    );

    return c.json<CoauthorshipInvitation>(await invitation(db, invitationId));
  }
);

app.get('/journeys', async (c) =>
  c.json<JourneySummary[]>(
    await journeySummaries(c.get('db'), c.get('viewer').id)
  )
);

function ownJourneyDetail(
  db: Database,
  env: Env,
  owner: JourneyOwner
): Promise<Journey> {
  return journeyDetail(db, ownedJourney(owner), encryptionSecrets(env));
}

const journeyParams = pathParams(z.object({ journeyId: id }));
const journeyChildParams = pathParams(z.object({ journeyId: id, id }));

app.get('/journeys/:id', idParams, async (c) =>
  c.json<Journey>(
    await ownJourneyDetail(c.get('db'), c.env, {
      userId: c.get('viewer').id,
      journeyId: c.req.valid('param').id
    })
  )
);

app.delete('/journeys/:id', idParams, async (c) => {
  await destroyJourney(c.get('db'), {
    userId: c.get('viewer').id,
    journeyId: c.req.valid('param').id
  });

  return c.body(null, 204);
});

app.post('/journeys/:id/start', idParams, async (c) => {
  const db = c.get('db');
  const owner = {
    userId: c.get('viewer').id,
    journeyId: c.req.valid('param').id
  };

  await startJourney(db, owner);

  return c.json<Journey>(await ownJourneyDetail(db, c.env, owner));
});

app.post('/journeys/:id/finish', idParams, jsonBody(finishInput), async (c) => {
  const db = c.get('db');
  const owner = {
    userId: c.get('viewer').id,
    journeyId: c.req.valid('param').id
  };

  await finishJourney(db, owner, {
    encodedPath: c.req.valid('json').encoded_path,
    secrets: encryptionSecrets(c.env)
  });

  return c.json<Journey>(await ownJourneyDetail(db, c.env, owner));
});

app.post(
  '/journeys/:journeyId/milestones',
  journeyParams,
  jsonBody(milestoneInput),
  async (c) => {
    const viewer = c.get('viewer');

    return c.json<Milestone>(
      await addMilestone(c.get('db'), viewer, {
        owner: { userId: viewer.id, journeyId: c.req.valid('param').journeyId },
        pinId: c.req.valid('json').pin_id
      })
    );
  }
);

app.delete(
  '/journeys/:journeyId/milestones/:id',
  journeyChildParams,
  async (c) => {
    const { journeyId, id: milestoneId } = c.req.valid('param');

    await removeMilestone(c.get('db'), {
      userId: c.get('viewer').id,
      journeyId,
      milestoneId
    });

    return c.body(null, 204);
  }
);

app.post(
  '/journeys/:journeyId/checkins',
  journeyParams,
  jsonBody(newCheckinInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const checkinId = await recordCheckin(db, viewer, {
      owner: { userId: viewer.id, journeyId: c.req.valid('param').journeyId },
      changes: c.req.valid('json')
    });

    return c.json<JourneyCheckin>(await journeyCheckin(db, checkinId));
  }
);

app.on(
  ['PUT', 'PATCH'],
  '/journeys/:journeyId/checkins/:id',
  journeyChildParams,
  jsonBody(checkinInput),
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const { journeyId, id: checkinId } = c.req.valid('param');
    const journey = await ownJourney(db, { userId: viewer.id, journeyId });

    await reviseCheckin(
      db,
      () => recordedCheckin(db, { journeyId: journey.id, checkinId }),
      { journey, editorId: viewer.id, changes: c.req.valid('json') }
    );

    return c.json<JourneyCheckin>(await journeyCheckin(db, checkinId));
  }
);

app.delete(
  '/journeys/:journeyId/checkins/:id',
  journeyChildParams,
  async (c) => {
    const db = c.get('db');
    const viewer = c.get('viewer');
    const { journeyId, id: checkinId } = c.req.valid('param');
    const journey = await ownJourney(db, { userId: viewer.id, journeyId });

    await discardCheckin(
      db,
      () => recordedCheckin(db, { journeyId: journey.id, checkinId }),
      viewer.id
    );

    return c.body(null, 204);
  }
);

app.get('/bookmarks/maps', async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');
  const rows = await db
    .select()
    .from(maps)
    .where(and(publicMap(), inArray(maps.id, bookmarkedBy(viewer))))
    .orderBy(desc(maps.createdAt), asc(maps.id));

  return c.json<AppMap[]>(await viewerMaps(db, viewer, rows));
});

app.get('/bookmarks/journals', async (c) => {
  const db = c.get('db');
  const viewer = c.get('viewer');

  return c.json<Journal[]>(
    await viewerJournals(
      db,
      viewer,
      inArray(
        journals.id,
        db
          .select({ id: journalBookmarks.journalId })
          .from(journalBookmarks)
          .where(eq(journalBookmarks.userId, viewer.id))
      )
    )
  );
});

export default app;
