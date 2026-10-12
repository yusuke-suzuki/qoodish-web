import { env } from 'cloudflare:test';
import { and, asc, eq } from 'drizzle-orm';
import { database, inIds } from '../db/client.ts';
import {
  chapterRevisionImages,
  chapterRevisions,
  commentRevisions,
  journals,
  journeyCheckinRevisionImages,
  journeyCheckinRevisions,
  maps,
  notifications,
  pinRevisionImages,
  pinRevisionPropertyOptions,
  pinRevisions,
  userRevisions,
  users,
  votes
} from '../db/schema.ts';
import { ids } from './world.ts';

const db = () => database(env.DB);

export async function accountOf(uid: string) {
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

export async function pinRevisionsOf(pinId: number) {
  const revisions = await db()
    .select()
    .from(pinRevisions)
    .where(eq(pinRevisions.pinId, pinId))
    .orderBy(asc(pinRevisions.id));
  const revisionImages = await db()
    .select()
    .from(pinRevisionImages)
    .orderBy(asc(pinRevisionImages.imageId));
  const revisionOptions = await db()
    .select()
    .from(pinRevisionPropertyOptions)
    .orderBy(asc(pinRevisionPropertyOptions.pinPropertyOptionId));

  return revisions.map((revision) => ({
    ...revision,
    imageIds: revisionImages
      .filter((image) => image.pinRevisionId === revision.id)
      .map((image) => image.imageId),
    propertyOptionIds: revisionOptions
      .filter((option) => option.pinRevisionId === revision.id)
      .map((option) => option.pinPropertyOptionId)
  }));
}

export async function chapterRevisionsOf(chapterId: number) {
  const revisions = await db()
    .select()
    .from(chapterRevisions)
    .where(eq(chapterRevisions.chapterId, chapterId))
    .orderBy(asc(chapterRevisions.id));
  const revisionImages = await db()
    .select()
    .from(chapterRevisionImages)
    .where(
      inIds(
        chapterRevisionImages.chapterRevisionId,
        revisions.map((revision) => revision.id)
      )
    )
    .orderBy(asc(chapterRevisionImages.imageId));

  return revisions.map((revision) => ({
    ...revision,
    imageIds: revisionImages
      .filter((image) => image.chapterRevisionId === revision.id)
      .map((image) => image.imageId)
  }));
}

export async function checkinRevisionsOf(checkinId: number) {
  const revisions = await db()
    .select()
    .from(journeyCheckinRevisions)
    .where(eq(journeyCheckinRevisions.journeyCheckinId, checkinId))
    .orderBy(asc(journeyCheckinRevisions.id));
  const revisionImages = await db()
    .select()
    .from(journeyCheckinRevisionImages)
    .where(
      inIds(
        journeyCheckinRevisionImages.journeyCheckinRevisionId,
        revisions.map((revision) => revision.id)
      )
    )
    .orderBy(asc(journeyCheckinRevisionImages.imageId));

  return revisions.map((revision) => ({
    ...revision,
    imageIds: revisionImages
      .filter((image) => image.journeyCheckinRevisionId === revision.id)
      .map((image) => image.imageId)
  }));
}

export async function commentRevisionsOf(commentId: number) {
  return db()
    .select({
      body: commentRevisions.body,
      status: commentRevisions.status,
      userId: commentRevisions.userId
    })
    .from(commentRevisions)
    .where(eq(commentRevisions.commentId, commentId))
    .orderBy(asc(commentRevisions.id));
}

function notificationsOf(key: string, type: string, id: number) {
  return db()
    .select({
      notifierId: notifications.notifierId,
      recipientId: notifications.recipientId
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.key, key),
        eq(notifications.notifiableType, type),
        eq(notifications.notifiableId, id)
      )
    );
}

export function likedNotifications(type: string, id: number) {
  return notificationsOf('liked', type, id);
}

export function commentNotifications(type: string, id: number) {
  return notificationsOf('comment', type, id);
}

export function publishedNotifications(chapterId: number) {
  return notificationsOf('published', 'Chapter', chapterId);
}

export async function chapterVotesBy(voterId: number) {
  return db()
    .select({ id: votes.id })
    .from(votes)
    .where(
      and(
        eq(votes.votableType, 'Chapter'),
        eq(votes.votableId, ids.noodleStory),
        eq(votes.voterId, voterId)
      )
    );
}
