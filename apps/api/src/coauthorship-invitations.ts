import type {
  CoauthorshipInvitation,
  CoauthorshipInvitationStatus
} from '@qoodish/api-contract';
import {
  and,
  asc,
  desc,
  eq,
  exists,
  inArray,
  ne,
  notExists,
  or,
  type SQL
} from 'drizzle-orm';
import {
  currentTimestamp,
  type Database,
  generatedId,
  selected,
  uniqueIds
} from './db/client.ts';
import {
  coauthorshipInvitations,
  coauthorships,
  maps,
  users
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import { primaryImage } from './images.ts';
import {
  addCoauthor,
  firstImageUrls,
  type MapRow,
  mapIdsOf,
  mapImagesQuery
} from './maps.ts';
import { recordNotification } from './notifications.ts';
import { first } from './routing.ts';
import { userSummary, usersQuery } from './users.ts';
import { editableMap, noBlockBetween, type Viewer } from './visibility.ts';

const STATUSES: readonly CoauthorshipInvitationStatus[] = [
  'pending',
  'accepted',
  'declined'
];
const PENDING = STATUSES.indexOf('pending');
const ACCEPTED = STATUSES.indexOf('accepted');
const DECLINED = STATUSES.indexOf('declined');

function invitedTo(db: Database, inviteeId: number, mapOwnerId: number) {
  return and(
    eq(coauthorshipInvitations.inviteeId, inviteeId),
    inArray(coauthorshipInvitations.mapId, mapIdsOf(db, mapOwnerId))
  );
}

export function declineInvitationsBetween(
  db: Database,
  [userId, otherId]: readonly [number, number],
  now: string
) {
  return db
    .update(coauthorshipInvitations)
    .set({ status: DECLINED, updatedAt: now })
    .where(
      and(
        eq(coauthorshipInvitations.status, PENDING),
        or(
          and(
            eq(coauthorshipInvitations.inviterId, userId),
            eq(coauthorshipInvitations.inviteeId, otherId)
          ),
          and(
            eq(coauthorshipInvitations.inviterId, otherId),
            eq(coauthorshipInvitations.inviteeId, userId)
          ),
          invitedTo(db, otherId, userId),
          invitedTo(db, userId, otherId)
        )
      )
    );
}

async function invitationsWhere(
  db: Database,
  condition: SQL | undefined
): Promise<CoauthorshipInvitation[]> {
  const rows = await db
    .select({
      id: coauthorshipInvitations.id,
      inviterId: coauthorshipInvitations.inviterId,
      status: coauthorshipInvitations.status,
      createdAt: coauthorshipInvitations.createdAt,
      updatedAt: coauthorshipInvitations.updatedAt,
      mapId: maps.id,
      mapName: maps.name,
      mapDescription: maps.description,
      mapRevisionId: maps.currentRevisionId
    })
    .from(coauthorshipInvitations)
    .innerJoin(maps, eq(maps.id, coauthorshipInvitations.mapId))
    .where(condition)
    .orderBy(
      desc(coauthorshipInvitations.createdAt),
      asc(coauthorshipInvitations.id)
    );

  if (rows.length === 0) {
    return [];
  }

  const [inviters, revisionImages] = await db.batch([
    usersQuery(db, uniqueIds(rows.map((row) => row.inviterId))),
    mapImagesQuery(db, uniqueIds(rows.map((row) => row.mapRevisionId)))
  ]);
  const invitersById = new Map(inviters.map((user) => [user.id, user]));
  const imageUrls = firstImageUrls(revisionImages);

  return rows.flatMap((row) => {
    const inviter = invitersById.get(row.inviterId);
    const status = STATUSES[row.status];

    if (!inviter || !status) {
      return [];
    }

    return [
      {
        id: row.id,
        map: {
          id: row.mapId,
          name: row.mapName,
          description: row.mapDescription,
          ...primaryImage(
            row.mapRevisionId === null
              ? undefined
              : imageUrls.get(row.mapRevisionId)
          )
        },
        inviter: userSummary(inviter),
        status,
        created_at: row.createdAt,
        updated_at: row.updatedAt
      }
    ];
  });
}

export function pendingInvitations(
  db: Database,
  userId: number
): Promise<CoauthorshipInvitation[]> {
  return invitationsWhere(
    db,
    and(
      eq(coauthorshipInvitations.inviteeId, userId),
      eq(coauthorshipInvitations.status, PENDING)
    )
  );
}

export async function invitation(
  db: Database,
  id: number
): Promise<CoauthorshipInvitation> {
  return first(await invitationsWhere(db, eq(coauthorshipInvitations.id, id)));
}

export async function inviteCoauthor(
  db: Database,
  viewer: Viewer,
  { map, inviteeId }: { map: MapRow; inviteeId: number }
): Promise<number> {
  const pendingFor = db
    .select({ id: coauthorshipInvitations.id })
    .from(coauthorshipInvitations)
    .where(
      and(
        eq(coauthorshipInvitations.mapId, map.id),
        eq(coauthorshipInvitations.inviteeId, inviteeId),
        eq(coauthorshipInvitations.status, PENDING)
      )
    );
  const coauthoring = db
    .select({ id: coauthorships.id })
    .from(coauthorships)
    .where(
      and(eq(coauthorships.mapId, map.id), eq(coauthorships.userId, inviteeId))
    );
  const invitationErrors = async (): Promise<MessageKey[]> => {
    const [pending, coauthor, unblocked] = await db.batch([
      pendingFor,
      coauthoring,
      db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.id, inviteeId),
            noBlockBetween(db, users.id, viewer.id),
            noBlockBetween(db, users.id, map.userId)
          )
        )
    ]);

    return [
      ...(pending.length > 0
        ? (['duplicate_pending_invitation'] as const)
        : []),
      ...(inviteeId === map.userId
        ? (['invitation_invitee_already_author'] as const)
        : []),
      ...(coauthor.length > 0 ? (['duplicate_coauthor'] as const) : []),
      ...(unblocked.length === 0
        ? (['invitation_blocked_interaction'] as const)
        : [])
    ];
  };
  const errors = await invitationErrors();

  if (errors.length > 0) {
    throw ApiError.invalid(errors);
  }

  const now = currentTimestamp();
  const invitable = exists(
    db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.id, inviteeId),
          ne(users.id, map.userId),
          notExists(pendingFor),
          notExists(coauthoring),
          noBlockBetween(db, users.id, viewer.id),
          noBlockBetween(db, users.id, map.userId),
          exists(
            db
              .select({ id: maps.id })
              .from(maps)
              .where(and(eq(maps.id, map.id), editableMap(viewer)))
          )
        )
      )
  );
  const [, created] = await db.batch([
    recordNotification(db, {
      key: 'coauthor_invited',
      notifiable: { type: 'Map', id: map.id },
      notifierId: viewer.id,
      recipientId: inviteeId,
      now,
      condition: invitable
    }),
    db
      .insert(coauthorshipInvitations)
      .select(
        db
          .select({
            id: generatedId(),
            createdAt: selected(now, 'created_at'),
            inviteeId: users.id,
            inviterId: selected(viewer.id, 'inviter_id'),
            mapId: selected(map.id, 'map_id'),
            status: selected(PENDING, 'status'),
            updatedAt: selected(now, 'updated_at')
          })
          .from(users)
          .where(and(eq(users.id, inviteeId), invitable))
      )
      .returning({ id: coauthorshipInvitations.id })
  ]);
  const [invitation] = created;

  if (invitation) {
    return invitation.id;
  }

  const refused = await invitationErrors();

  if (refused.length > 0) {
    throw ApiError.invalid(refused);
  }

  throw new ApiError('NotFound');
}

export async function answerInvitation(
  db: Database,
  { inviteeId, id }: { inviteeId: number; id: number },
  answer: 'accepted' | 'declined'
): Promise<void> {
  const pending = and(
    eq(coauthorshipInvitations.id, id),
    eq(coauthorshipInvitations.inviteeId, inviteeId),
    eq(coauthorshipInvitations.status, PENDING)
  );
  const { mapId } = first(
    await db
      .select({ mapId: coauthorshipInvitations.mapId })
      .from(coauthorshipInvitations)
      .where(pending)
  );
  const now = currentTimestamp();
  const answering = db
    .update(coauthorshipInvitations)
    .set({
      status: answer === 'accepted' ? ACCEPTED : DECLINED,
      updatedAt: now
    })
    .where(pending)
    .returning({ id: coauthorshipInvitations.id });
  const answered =
    answer === 'accepted'
      ? (
          await db.batch([
            addCoauthor(db, {
              mapId,
              userId: inviteeId,
              now,
              condition: exists(
                db
                  .select({ id: coauthorshipInvitations.id })
                  .from(coauthorshipInvitations)
                  .where(pending)
              )
            }),
            answering
          ])
        )[1]
      : await answering;

  if (answered.length === 0) {
    throw new ApiError('NotFound');
  }
}
