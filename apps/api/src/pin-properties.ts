import type {
  PinProperty,
  PinPropertyOption as PinPropertyOptionShape
} from '@qoodish/api-contract';
import { and, asc, eq, max, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import {
  currentTimestamp,
  type Database,
  reviseUntilCurrent,
  scalar,
  unrevisedRecord
} from './db/client.ts';
import {
  pinProperties,
  pinPropertyOptionRevisions,
  pinPropertyOptions,
  pinPropertyRevisions
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { MessageKey } from './i18n/index.ts';
import { first } from './routing.ts';
import { characters } from './text.ts';
import { position } from './validation.ts';

const NAME_LIMIT = 30;

function tagName({
  required,
  exceed
}: {
  required: MessageKey;
  exceed: MessageKey;
}) {
  return z
    .string({ error: required })
    .trim()
    .refine((name) => name !== '', { error: required })
    .refine((name) => characters(name) <= NAME_LIMIT, { error: exceed });
}

const propertyName = tagName({
  required: 'pin_property_name_required',
  exceed: 'pin_property_name_exceed'
});

const optionName = tagName({
  required: 'pin_property_option_name_required',
  exceed: 'pin_property_option_name_exceed'
});

export const newPinPropertyInput = z.object({
  name: propertyName,
  position: position.optional(),
  multiple: z.boolean().optional()
});

export const pinPropertyInput = z.object({
  name: propertyName.optional(),
  position: position.optional()
});

export const newPinPropertyOptionInput = z.object({
  name: optionName,
  position: position.optional()
});

export const pinPropertyOptionInput = z.object({
  name: optionName.optional(),
  position: position.optional()
});

type Status = 'published' | 'deleted';

type NamedContent = { name: string; position: number; status: Status };

type NamedChanges = { name?: string; position?: number };

type PropertyRow = typeof pinProperties.$inferSelect;
type OptionRow = typeof pinPropertyOptions.$inferSelect;

function contentOf(row: PropertyRow | OptionRow): NamedContent {
  return {
    name: row.name,
    position: row.position,
    status: row.status === 'deleted' ? 'deleted' : 'published'
  };
}

function revised(current: NamedContent, next: NamedContent): boolean {
  return (
    current.name !== next.name ||
    current.position !== next.position ||
    current.status !== next.status
  );
}

function nextContent(current: NamedContent, changes: NamedChanges) {
  return {
    ...current,
    name: changes.name ?? current.name,
    position: changes.position ?? current.position
  };
}

function propertyRevisionStatements(
  db: Database,
  {
    propertyId,
    editorId,
    content,
    now
  }: {
    propertyId: number | SQL;
    editorId: number;
    content: NamedContent;
    now: string;
  }
) {
  return [
    db.insert(pinPropertyRevisions).values({
      ...content,
      pinPropertyId: propertyId,
      userId: editorId,
      createdAt: now,
      updatedAt: now
    }),
    db
      .update(pinProperties)
      .set({
        currentRevisionId: scalar(
          db
            .select({ id: max(pinPropertyRevisions.id).as('id') })
            .from(pinPropertyRevisions)
            .where(eq(pinPropertyRevisions.pinPropertyId, propertyId))
        )
      })
      .where(eq(pinProperties.id, propertyId))
  ] as const;
}

function optionRevisionStatements(
  db: Database,
  {
    optionId,
    editorId,
    content,
    now
  }: {
    optionId: number | SQL;
    editorId: number;
    content: NamedContent;
    now: string;
  }
) {
  return [
    db.insert(pinPropertyOptionRevisions).values({
      ...content,
      pinPropertyOptionId: optionId,
      userId: editorId,
      createdAt: now,
      updatedAt: now
    }),
    db
      .update(pinPropertyOptions)
      .set({
        currentRevisionId: scalar(
          db
            .select({ id: max(pinPropertyOptionRevisions.id).as('id') })
            .from(pinPropertyOptionRevisions)
            .where(eq(pinPropertyOptionRevisions.pinPropertyOptionId, optionId))
        )
      })
      .where(eq(pinPropertyOptions.id, optionId))
  ] as const;
}

export async function editablePinProperty(
  db: Database,
  { id, mapId }: { id: number; mapId: SQL }
): Promise<PropertyRow> {
  return first(
    await db
      .select()
      .from(pinProperties)
      .where(
        and(
          eq(pinProperties.id, id),
          eq(pinProperties.status, 'published'),
          eq(pinProperties.mapId, mapId)
        )
      )
  );
}

export async function publishedOption(
  db: Database,
  { id, propertyId }: { id: number; propertyId: number }
): Promise<OptionRow> {
  return first(
    await db
      .select()
      .from(pinPropertyOptions)
      .where(
        and(
          eq(pinPropertyOptions.id, id),
          eq(pinPropertyOptions.pinPropertyId, propertyId),
          eq(pinPropertyOptions.status, 'published')
        )
      )
  );
}

export async function createPinProperty(
  db: Database,
  {
    mapId,
    editorId,
    changes
  }: {
    mapId: number;
    editorId: number;
    changes: z.output<typeof newPinPropertyInput>;
  }
): Promise<number> {
  const content: NamedContent = {
    name: changes.name,
    position: changes.position ?? 0,
    status: 'published'
  };

  const now = currentTimestamp();
  const propertyId = scalar(
    db
      .select({ id: max(pinProperties.id).as('id') })
      .from(pinProperties)
      .where(eq(pinProperties.mapId, mapId))
  );
  const results = await db.batch([
    db.insert(pinProperties).values({
      ...content,
      mapId,
      multiple: changes.multiple ?? false,
      createdAt: now,
      updatedAt: now
    }),
    ...propertyRevisionStatements(db, { propertyId, editorId, content, now }),
    db
      .select({ id: pinProperties.id })
      .from(pinProperties)
      .where(eq(pinProperties.id, propertyId))
  ]);

  return first(results[results.length - 1] as { id: number }[]).id;
}

export function revisePinProperty(
  db: Database,
  read: () => Promise<PropertyRow>,
  {
    editorId,
    changes,
    status
  }: { editorId: number; changes?: NamedChanges; status?: Status }
): Promise<void> {
  return reviseUntilCurrent(pinPropertyRevisions.pinPropertyId, async () => {
    const property = await read();
    const current = contentOf(property);
    const content = {
      ...nextContent(current, changes ?? {}),
      status: status ?? current.status
    };

    if (!revised(current, content)) {
      return;
    }

    const now = currentTimestamp();

    await db.batch([
      db
        .update(pinProperties)
        .set({ ...content, updatedAt: now })
        .where(eq(pinProperties.id, property.id)),
      ...propertyRevisionStatements(db, {
        propertyId: unrevisedRecord(db, pinProperties, property),
        editorId,
        content,
        now
      })
    ]);
  });
}

export async function createPinPropertyOption(
  db: Database,
  {
    propertyId,
    editorId,
    changes
  }: {
    propertyId: number;
    editorId: number;
    changes: z.output<typeof newPinPropertyOptionInput>;
  }
): Promise<number> {
  const content: NamedContent = {
    name: changes.name,
    position: changes.position ?? 0,
    status: 'published'
  };

  const now = currentTimestamp();
  const optionId = scalar(
    db
      .select({ id: max(pinPropertyOptions.id).as('id') })
      .from(pinPropertyOptions)
      .where(eq(pinPropertyOptions.pinPropertyId, propertyId))
  );
  const results = await db.batch([
    db.insert(pinPropertyOptions).values({
      ...content,
      pinPropertyId: propertyId,
      createdAt: now,
      updatedAt: now
    }),
    ...optionRevisionStatements(db, { optionId, editorId, content, now }),
    db
      .select({ id: pinPropertyOptions.id })
      .from(pinPropertyOptions)
      .where(eq(pinPropertyOptions.id, optionId))
  ]);

  return first(results[results.length - 1] as { id: number }[]).id;
}

export function revisePinPropertyOption(
  db: Database,
  read: () => Promise<OptionRow>,
  {
    editorId,
    changes,
    status
  }: { editorId: number; changes?: NamedChanges; status?: Status }
): Promise<void> {
  return reviseUntilCurrent(
    pinPropertyOptionRevisions.pinPropertyOptionId,
    async () => {
      const option = await read();
      const current = contentOf(option);
      const content = {
        ...nextContent(current, changes ?? {}),
        status: status ?? current.status
      };

      if (!revised(current, content)) {
        return;
      }

      const now = currentTimestamp();

      await db.batch([
        db
          .update(pinPropertyOptions)
          .set({ ...content, updatedAt: now })
          .where(eq(pinPropertyOptions.id, option.id)),
        ...optionRevisionStatements(db, {
          optionId: unrevisedRecord(db, pinPropertyOptions, option),
          editorId,
          content,
          now
        })
      ]);
    }
  );
}

export async function pinPropertyDetail(
  db: Database,
  propertyId: number
): Promise<PinProperty> {
  const [[property], options] = await db.batch([
    db.select().from(pinProperties).where(eq(pinProperties.id, propertyId)),
    db
      .select()
      .from(pinPropertyOptions)
      .where(
        and(
          eq(pinPropertyOptions.pinPropertyId, propertyId),
          eq(pinPropertyOptions.status, 'published')
        )
      )
      .orderBy(asc(pinPropertyOptions.position), asc(pinPropertyOptions.id))
  ]);

  if (!property) {
    throw new ApiError('NotFound');
  }

  return {
    id: property.id,
    name: property.name,
    multiple: property.multiple,
    position: property.position,
    options: options.map(optionShape)
  };
}

export function optionShape(option: OptionRow): PinPropertyOptionShape {
  return { id: option.id, name: option.name, position: option.position };
}

export async function pinPropertyOptionDetail(
  db: Database,
  optionId: number
): Promise<PinPropertyOptionShape> {
  return optionShape(
    first(
      await db
        .select()
        .from(pinPropertyOptions)
        .where(eq(pinPropertyOptions.id, optionId))
    )
  );
}
