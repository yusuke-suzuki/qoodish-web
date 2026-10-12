import {
  and,
  type Column,
  eq,
  getTableName,
  type SQL,
  type SQLWrapper,
  sql
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { AnySQLiteColumn, AnySQLiteTable } from 'drizzle-orm/sqlite-core';
import { ApiError } from '../errors.ts';
import * as schema from './schema.ts';

const REVISION_ATTEMPTS = 3;

export function database(binding: D1Database) {
  return drizzle(binding, { schema });
}

export type Database = ReturnType<typeof database>;

export function inIds(column: SQLWrapper, ids: readonly number[]): SQL {
  return sql`${column} IN (SELECT value FROM json_each(${JSON.stringify(ids)}))`;
}

export function scalar(query: SQLWrapper): SQL<number> {
  return sql<number>`(${query})`;
}

export function generatedId(): SQL.Aliased<number> {
  return sql<number>`NULL`.as('id');
}

export function selected<Value>(value: Value, alias: string) {
  return sql<Value>`${value}`.as(alias);
}

export function currentTimestamp(): string {
  return new Date().toISOString().replace('Z', '000Z');
}

export function uniqueIds(ids: Iterable<number | null>): number[] {
  return [...new Set([...ids].filter((id): id is number => id !== null))];
}

export function chunks<Item>(items: readonly Item[], size: number): Item[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size)
  );
}

export function constraintViolated(
  error: unknown,
  constraint: 'UNIQUE' | 'NOT NULL',
  ...columns: [Column, ...Column[]]
): boolean {
  const failure = `${constraint} constraint failed: ${columns
    .map((column) => `${getTableName(column.table)}.${column.name}`)
    .join(', ')}`;

  for (
    let current: unknown = error;
    current instanceof Error;
    current = current.cause
  ) {
    const at = current.message.indexOf(failure);

    if (at !== -1 && current.message[at + failure.length] !== ',') {
      return true;
    }
  }

  return false;
}

export function unrevisedRecord(
  db: Database,
  table: AnySQLiteTable & {
    id: AnySQLiteColumn;
    currentRevisionId: AnySQLiteColumn;
  },
  record: { id: number; currentRevisionId: number | null }
): SQL<number> {
  return scalar(
    db
      .select({ id: table.id })
      .from(table)
      .where(
        and(
          eq(table.id, record.id),
          sql`${table.currentRevisionId} IS ${record.currentRevisionId}`
        )
      )
  );
}

export async function reviseUntilCurrent<T>(
  revisionParent: Column,
  revise: () => Promise<T>
): Promise<T> {
  for (let attempt = 1; attempt <= REVISION_ATTEMPTS; attempt++) {
    try {
      return await revise();
    } catch (error) {
      if (!constraintViolated(error, 'NOT NULL', revisionParent)) {
        throw error;
      }
    }
  }

  throw new ApiError('Conflict');
}
