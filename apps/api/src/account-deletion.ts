import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep
} from 'cloudflare:workers';
import { and, eq, inArray, or } from 'drizzle-orm';
import {
  devicesOfUserDeletion,
  preferencesOfUserDeletion
} from './accounts.ts';
import { deleteIdentityPlatformAccount } from './auth/identity-platform.ts';
import { bookmarksDeletion, journalBookmarksDeletion } from './bookmarks.ts';
import {
  chapterRevisionImagesOfImagesDeletion,
  chapterRevisionsDeletion,
  chaptersDeletion,
  detachChaptersFromMaps
} from './chapters.ts';
import {
  cloudflareImageId,
  deleteCloudflareImage
} from './cloudflare-images.ts';
import { coauthorshipInvitationsDeletion } from './coauthorship-invitations.ts';
import { commentRevisionsDeletion, commentsDeletion } from './comments.ts';
import { chunks, type Database, database } from './db/client.ts';
import {
  chapters,
  comments,
  images,
  journals,
  journeys,
  maps,
  pinProperties,
  pins
} from './db/schema.ts';
import type { Env } from './env.ts';
import { imagesDeletion } from './images.ts';
import { journalsDeletion } from './journals.ts';
import {
  checkinRevisionImagesOfImagesDeletion,
  detachJourneysFromMaps,
  detachJourneysFromPins,
  journeyDependentsDeletion,
  journeysDeletion
} from './journeys.ts';
import {
  coauthorshipsDeletion,
  detachMapRevisionsFromUser,
  featuredMapsDeletion,
  mapRevisionImagesOfImagesDeletion,
  mapRevisionsDeletion,
  mapsDeletion
} from './maps.ts';
import {
  notificationsOfUserDeletion,
  notificationsOnDeletion
} from './notifications.ts';
import { pinPropertiesDeletion } from './pin-properties.ts';
import {
  pinRevisionImagesOfImagesDeletion,
  pinRevisionsDeletion,
  pinsDeletion
} from './pins.ts';
import { detachReportsFromUser } from './reports.ts';
import { userDeletion, userRevisionsDeletion } from './users.ts';
import { votesByUserDeletion, votesOnDeletion } from './votes.ts';

const IMAGE_DELETION_CONCURRENCY = 6;

export type Account = { id: number; uid: string };

function accountDeletion(
  db: Database,
  userId: number,
  deletedImageIds: readonly number[]
) {
  const ownedMaps = db
    .select({ id: maps.id })
    .from(maps)
    .where(eq(maps.userId, userId));
  const removedPins = db
    .select({ id: pins.id })
    .from(pins)
    .where(or(eq(pins.userId, userId), inArray(pins.mapId, ownedMaps)));
  const ownedChapters = db
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.userId, userId));
  const removedComments = db
    .select({ id: comments.id })
    .from(comments)
    .where(
      or(
        eq(comments.userId, userId),
        and(
          eq(comments.commentableType, 'Pin'),
          inArray(comments.commentableId, removedPins)
        ),
        and(
          eq(comments.commentableType, 'Chapter'),
          inArray(comments.commentableId, ownedChapters)
        )
      )
    );
  const removedProperties = db
    .select({ id: pinProperties.id })
    .from(pinProperties)
    .where(inArray(pinProperties.mapId, ownedMaps));
  const ownedJourneys = db
    .select({ id: journeys.id })
    .from(journeys)
    .where(eq(journeys.userId, userId));
  const ownedJournals = db
    .select({ id: journals.id })
    .from(journals)
    .where(eq(journals.userId, userId));
  const ownedImages = db
    .select({ id: images.id })
    .from(images)
    .where(eq(images.userId, userId));

  return [
    devicesOfUserDeletion(db, userId),
    commentRevisionsDeletion(db, removedComments),
    votesOnDeletion(db, 'Comment', removedComments),
    notificationsOnDeletion(db, 'Comment', removedComments),
    commentsDeletion(db, removedComments),
    ...pinRevisionsDeletion(db, removedPins),
    votesOnDeletion(db, 'Pin', removedPins),
    notificationsOnDeletion(db, 'Pin', removedPins),
    ...detachJourneysFromPins(db, removedPins),
    pinsDeletion(db, removedPins),
    ...pinPropertiesDeletion(db, removedProperties),
    ...mapRevisionsDeletion(db, ownedMaps),
    votesOnDeletion(db, 'Map', ownedMaps),
    notificationsOnDeletion(db, 'Map', ownedMaps),
    coauthorshipsDeletion(db, { userId, mapIds: ownedMaps }),
    bookmarksDeletion(db, { userId, mapIds: ownedMaps }),
    coauthorshipInvitationsDeletion(db, { userId, mapIds: ownedMaps }),
    featuredMapsDeletion(db, ownedMaps),
    detachJourneysFromMaps(db, ownedMaps),
    detachChaptersFromMaps(db, ownedMaps),
    mapsDeletion(db, ownedMaps),
    detachMapRevisionsFromUser(db, userId),
    votesByUserDeletion(db, userId),
    ...journeyDependentsDeletion(db, ownedJourneys),
    journeysDeletion(db, ownedJourneys),
    ...chapterRevisionsDeletion(db, ownedChapters),
    votesOnDeletion(db, 'Chapter', ownedChapters),
    notificationsOnDeletion(db, 'Chapter', ownedChapters),
    chaptersDeletion(db, ownedChapters),
    journalBookmarksDeletion(db, { userId, journalIds: ownedJournals }),
    ...journalsDeletion(db, ownedJournals),
    userRevisionsDeletion(db, userId),
    mapRevisionImagesOfImagesDeletion(db, ownedImages),
    pinRevisionImagesOfImagesDeletion(db, ownedImages),
    chapterRevisionImagesOfImagesDeletion(db, ownedImages),
    checkinRevisionImagesOfImagesDeletion(db, ownedImages),
    imagesDeletion(db, ownedImages, deletedImageIds),
    preferencesOfUserDeletion(db, userId),
    notificationsOfUserDeletion(db, userId),
    ...detachReportsFromUser(db, userId),
    userDeletion(db, userId)
  ] as const;
}

async function deleteOwnedRecords(env: Env, userId: number): Promise<void> {
  const db = database(env.DB);
  const ownedImages = await db
    .select({ id: images.id, url: images.url })
    .from(images)
    .where(eq(images.userId, userId));
  const cloudflareIds = ownedImages
    .map(({ url }) => cloudflareImageId(env, url))
    .filter((imageId) => imageId !== undefined);

  for (const group of chunks(cloudflareIds, IMAGE_DELETION_CONCURRENCY)) {
    await Promise.all(
      group.map((imageId) => deleteCloudflareImage(env, imageId))
    );
  }

  await db.batch(
    accountDeletion(
      db,
      userId,
      ownedImages.map(({ id }) => id)
    )
  );
}

export class AccountDeletion extends WorkflowEntrypoint<Env, Account> {
  async run(event: WorkflowEvent<Account>, step: WorkflowStep): Promise<void> {
    const { id, uid } = event.payload;

    await step.do('delete the Identity Platform account', () =>
      deleteIdentityPlatformAccount(this.env, uid)
    );
    await step.do('delete the records and images the user owns', () =>
      deleteOwnedRecords(this.env, id)
    );
  }
}
