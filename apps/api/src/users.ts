import type {
  GuestChapterAuthor,
  GuestUserProfile,
  UserProfile,
  UserSummary,
  ViewerRelation
} from '@qoodish/api-contract';
import { and, eq, inArray, max, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import {
  constraintViolated,
  currentTimestamp,
  type Database,
  inIds,
  reviseUntilCurrent,
  scalar,
  unrevisedRecord
} from './db/client.ts';
import {
  bookmarks,
  images,
  journals,
  maps,
  pins,
  userRevisions,
  users,
  votes
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { Locale } from './i18n/index.ts';
import { primaryImage } from './images.ts';
import { recordDefaultJournal } from './journals.ts';
import { recordDefaultMap } from './maps.ts';
import { first } from './routing.ts';
import { id, optionalText, text } from './validation.ts';
import type { Viewer } from './visibility.ts';

const USER_BIOGRAPHY_LIMIT = 160;

type UserContent = { name: string | null; biography: string | null };

export type SignInClaims = {
  uid: string;
  name: string | undefined;
  email: string | undefined;
  locale: Locale;
};

export const profileInput = z
  .object({
    name: text({ required: 'user_name_required' }).optional(),
    biography: optionalText({
      length: USER_BIOGRAPHY_LIMIT,
      error: 'user_biography_exceed'
    }).optional(),
    image_ids: z.array(id).optional()
  })
  .transform(({ image_ids, ...changes }) => ({
    ...changes,
    imageId: image_ids === undefined ? undefined : (image_ids[0] ?? null)
  }));

type ProfileChanges = z.output<typeof profileInput>;

function blank(text: string | null | undefined): boolean {
  return text === null || text === undefined || text.trim() === '';
}

function userRevisionStatements(
  db: Database,
  {
    userId,
    content,
    now
  }: { userId: number | SQL; content: UserContent; now: string }
) {
  return [
    db
      .insert(userRevisions)
      .values({ ...content, userId, createdAt: now, updatedAt: now }),
    db
      .update(users)
      .set({
        currentRevisionId: scalar(
          db
            .select({ id: max(userRevisions.id) })
            .from(userRevisions)
            .where(eq(userRevisions.userId, userId))
        )
      })
      .where(eq(users.id, userId))
  ] as const;
}

async function createAccount(
  db: Database,
  { uid, name, email, locale }: SignInClaims
): Promise<number> {
  if (name === undefined || blank(name)) {
    throw ApiError.invalid(['user_name_required']);
  }

  const content = { name, biography: null };
  const now = currentTimestamp();
  const userId = scalar(
    db.select({ id: users.id }).from(users).where(eq(users.uid, uid))
  );
  const results = await db.batch([
    db.insert(users).values({
      uid,
      ...content,
      email: blank(email) ? null : email,
      locale,
      createdAt: now,
      updatedAt: now
    }),
    ...userRevisionStatements(db, { userId, content, now }),
    ...recordDefaultMap(db, { userId, ownerName: name, now }),
    ...recordDefaultJournal(db, { userId, ownerName: name, now }),
    accountQuery(db, uid)
  ]);

  return first(results[results.length - 1] as { id: number }[]).id;
}

async function refreshAccount(
  db: Database,
  user: { id: number; email: string | null; locale: string | null },
  { email, locale }: SignInClaims
): Promise<void> {
  const changes = {
    email: blank(email) ? user.email : (email ?? null),
    locale
  };

  if (changes.email === user.email && changes.locale === user.locale) {
    return;
  }

  await db
    .update(users)
    .set({ ...changes, updatedAt: currentTimestamp() })
    .where(eq(users.id, user.id));
}

function accountQuery(db: Database, uid: string) {
  return db
    .select({ id: users.id, email: users.email, locale: users.locale })
    .from(users)
    .where(eq(users.uid, uid));
}

export async function signIn(
  db: Database,
  claims: SignInClaims
): Promise<number> {
  const [existing] = await accountQuery(db, claims.uid);

  if (existing) {
    await refreshAccount(db, existing, claims);
    return existing.id;
  }

  try {
    return await createAccount(db, claims);
  } catch (error) {
    if (!constraintViolated(error, 'UNIQUE', users.uid)) {
      throw error;
    }

    const user = first(await accountQuery(db, claims.uid));
    await refreshAccount(db, user, claims);
    return user.id;
  }
}

export function updateProfile(
  db: Database,
  userId: number,
  changes: ProfileChanges
): Promise<void> {
  return reviseUntilCurrent(userRevisions.userId, () =>
    writeProfile(db, userId, changes)
  );
}

async function writeProfile(
  db: Database,
  userId: number,
  changes: ProfileChanges
): Promise<void> {
  const user = first(
    await db
      .select({
        name: users.name,
        biography: users.biography,
        imageId: users.imageId,
        currentRevisionId: users.currentRevisionId
      })
      .from(users)
      .where(eq(users.id, userId))
  );
  const content: UserContent = {
    name: changes.name ?? user.name,
    biography:
      changes.biography === undefined ? user.biography : changes.biography
  };
  const imageId =
    changes.imageId === undefined ? user.imageId : changes.imageId;

  if (imageId !== user.imageId && imageId !== null) {
    const [image] = await db
      .select({ userId: images.userId })
      .from(images)
      .where(eq(images.id, imageId));

    if (image?.userId !== userId) {
      throw ApiError.invalid(['image_not_owned']);
    }
  }

  const revised =
    content.name !== user.name || content.biography !== user.biography;
  const imageChanged = imageId !== user.imageId;

  if (!revised && !imageChanged) {
    return;
  }

  const now = currentTimestamp();
  const update = db
    .update(users)
    .set({
      ...(revised ? content : {}),
      ...(imageChanged ? { imageId } : {}),
      updatedAt: now
    })
    .where(eq(users.id, userId));
  await db.batch(
    revised
      ? [
          update,
          ...userRevisionStatements(db, {
            userId: unrevisedRecord(db, users, {
              id: userId,
              currentRevisionId: user.currentRevisionId
            }),
            content,
            now
          })
        ]
      : [update]
  );
}

export type UserRow = {
  id: number;
  name: string | null;
  biography: string | null;
  imageUrl: string | null;
};

export const userColumns = {
  id: users.id,
  name: users.name,
  biography: users.biography,
  imageUrl: images.url
};

export function usersQuery(db: Database, ids: readonly number[]) {
  return db
    .select(userColumns)
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(inIds(users.id, ids));
}

export function journalsQuery(db: Database, userIds: readonly number[]) {
  return db
    .select({ id: journals.id, title: journals.title, userId: journals.userId })
    .from(journals)
    .where(inIds(journals.userId, userIds));
}

export function relation(viewer: Viewer, userId: number): ViewerRelation {
  return {
    blocking: viewer.blocking.has(userId),
    muting: viewer.muting.has(userId)
  };
}

export async function findUser(db: Database, id: number) {
  return first(
    await db.select({ id: users.id }).from(users).where(eq(users.id, id))
  );
}

export function userSummary(user: UserRow): UserSummary {
  return {
    id: user.id,
    name: user.name ?? '',
    ...primaryImage(user.imageUrl ?? undefined)
  };
}

export function chapterAuthor(user: UserRow): GuestChapterAuthor {
  const { image, image_url } = primaryImage(user.imageUrl ?? undefined);

  return {
    id: user.id,
    name: user.name ?? '',
    biography: user.biography,
    image,
    image_url
  };
}

export function profileCounts(db: Database) {
  return {
    mapsCount: db.$count(
      maps,
      and(eq(maps.userId, users.id), eq(maps.status, 'published'))
    ),
    bookmarkedMapsCount: db.$count(
      bookmarks,
      and(
        eq(bookmarks.userId, users.id),
        inArray(
          bookmarks.mapId,
          db
            .select({ id: maps.id })
            .from(maps)
            .where(eq(maps.status, 'published'))
        )
      )
    ),
    pinsCount: db.$count(
      pins,
      and(eq(pins.userId, users.id), eq(pins.status, 'published'))
    )
  };
}

export function profileQuery(db: Database, id: number) {
  return db
    .select({ ...userColumns, uid: users.uid, ...profileCounts(db) })
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(eq(users.id, id));
}

type ProfileRow = Awaited<ReturnType<typeof profileQuery>>[number];

export function profileAttributes(user: ProfileRow) {
  const { image, image_url } = primaryImage(user.imageUrl ?? undefined);

  return {
    id: user.id,
    uid: user.uid,
    name: user.name ?? '',
    biography: user.biography,
    image,
    image_url,
    maps_count: user.mapsCount,
    bookmarked_maps_count: user.bookmarkedMapsCount,
    pins_count: user.pinsCount
  };
}

export async function guestProfile(
  db: Database,
  id: number
): Promise<GuestUserProfile | null> {
  const [user] = await db
    .select({
      ...userColumns,
      ...profileCounts(db),
      likesCount: db.$count(
        votes,
        and(eq(votes.voterId, users.id), eq(votes.voterType, 'User'))
      )
    })
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(eq(users.id, id));

  if (!user) {
    return null;
  }

  const { image, image_url } = primaryImage(user.imageUrl ?? undefined);

  return {
    id: user.id,
    name: user.name ?? '',
    biography: user.biography,
    image,
    image_url,
    maps_count: user.mapsCount,
    bookmarked_maps_count: user.bookmarkedMapsCount,
    pins_count: user.pinsCount,
    likes_count: user.likesCount
  };
}

export async function userProfile(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<UserProfile | null> {
  const [user] = await profileQuery(db, id);

  if (!user) {
    return null;
  }

  return {
    ...profileAttributes(user),
    blocking: viewer.blocking.has(user.id),
    blocked_by: viewer.blockedBy.has(user.id),
    muting: viewer.muting.has(user.id)
  };
}
