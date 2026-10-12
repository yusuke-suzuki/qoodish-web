import { and, eq, inArray, or } from 'drizzle-orm';
import type { Database } from './db/client.ts';
import { coauthorshipInvitations } from './db/schema.ts';
import { mapIdsOf } from './maps.ts';

const PENDING = 0;
const DECLINED = 2;

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
