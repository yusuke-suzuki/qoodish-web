import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ApiError, type ErrorTitle } from './errors.ts';
import { isMessageKey, type MessageKey } from './i18n/index.ts';
import { characters, withoutCarriageReturns } from './text.ts';

function rejection(issues: readonly z.core.$ZodIssue[]): ApiError {
  const keys = issues.map((issue) => issue.message);

  if (keys.length > 0 && keys.every(isMessageKey)) {
    return ApiError.invalid([...new Set(keys)]);
  }

  return new ApiError('BadRequest');
}

export function jsonBody<Schema extends z.ZodType>(schema: Schema) {
  return zValidator('json', schema, (result) => {
    if (!result.success) {
      throw rejection(result.error.issues);
    }
  });
}

export function pathParams<Schema extends z.ZodType>(
  schema: Schema,
  rejectedAs: ErrorTitle = 'NotFound'
) {
  return zValidator('param', schema, (result) => {
    if (!result.success) {
      throw new ApiError(rejectedAs);
    }
  });
}

export const id = z.union([
  z.int().positive(),
  z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.int().positive())
]);

export function optionalId(value: unknown): number | undefined {
  const parsed = id.safeParse(value);

  return parsed.success ? parsed.data : undefined;
}

export function text({
  required,
  max
}: {
  required: MessageKey;
  max?: { length: number; error: MessageKey };
}) {
  const present = z
    .string({ error: required })
    .overwrite(withoutCarriageReturns)
    .refine((value) => value.trim() !== '', { error: required, abort: true });

  return max
    ? present.refine((value) => characters(value) <= max.length, {
        error: max.error
      })
    : present;
}

export function optionalText(max: { length: number; error: MessageKey }) {
  return z
    .string()
    .refine((value) => characters(value) <= max.length, { error: max.error })
    .nullable();
}
