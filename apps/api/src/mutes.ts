import { and, eq, notExists } from 'drizzle-orm';
import {
  currentTimestamp,
  type Database,
  generatedId,
  selected
} from './db/client.ts';
import { mutes, unmutes, users } from './db/schema.ts';
import { ApiError } from './errors.ts';

export function activeMute(db: Database) {
  return notExists(
    db
      .select({ id: unmutes.id })
      .from(unmutes)
      .where(eq(unmutes.muteId, mutes.id))
  );
}

export async function muteUser(
  db: Database,
  { muterId, mutedId }: { muterId: number; mutedId: number }
): Promise<void> {
  if (muterId === mutedId) {
    throw ApiError.invalid(['mute_self']);
  }

  await db.insert(mutes).select(
    db
      .select({
        id: generatedId(),
        createdAt: selected(currentTimestamp(), 'created_at'),
        mutedId: users.id,
        muterId: selected(muterId, 'muter_id')
      })
      .from(users)
      .where(
        and(
          eq(users.id, mutedId),
          notExists(
            db
              .select({ id: mutes.id })
              .from(mutes)
              .where(
                and(
                  eq(mutes.muterId, muterId),
                  eq(mutes.mutedId, mutedId),
                  activeMute(db)
                )
              )
          )
        )
      )
  );
}

export async function unmuteUser(
  db: Database,
  { muterId, mutedId }: { muterId: number; mutedId: number }
): Promise<void> {
  await db
    .insert(unmutes)
    .select(
      db
        .select({
          id: generatedId(),
          createdAt: selected(currentTimestamp(), 'created_at'),
          muteId: mutes.id
        })
        .from(mutes)
        .where(
          and(
            eq(mutes.muterId, muterId),
            eq(mutes.mutedId, mutedId),
            activeMute(db)
          )
        )
    )
    .onConflictDoNothing();
}
