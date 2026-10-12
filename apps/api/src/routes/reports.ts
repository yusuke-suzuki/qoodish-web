import type { ReportReceipt } from '@qoodish/api-contract';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';
import {
  DETAILS_REQUIRED_CATEGORIES,
  fileReport,
  MAX_REPORT_DETAILS_LENGTH,
  MODERATABLE_TYPES,
  REPORT_CATEGORIES
} from '../reports.ts';
import { present } from '../routing.ts';
import { characters, withoutCarriageReturns } from '../text.ts';
import { jsonBody, optionalId } from '../validation.ts';

const reportBody = z
  .object({
    moderatable_type: z.enum(MODERATABLE_TYPES).optional().catch(undefined),
    moderatable_id: z.unknown().transform(optionalId),
    category: z.enum(REPORT_CATEGORIES, { error: 'report_category_invalid' }),
    details: z
      .string()
      .overwrite(withoutCarriageReturns)
      .refine(
        (details) =>
          !present(details) || characters(details) <= MAX_REPORT_DETAILS_LENGTH,
        { error: 'report_details_exceed' }
      )
      .nullish()
  })
  .refine(
    ({ category, details }) =>
      !DETAILS_REQUIRED_CATEGORIES.includes(category) || present(details),
    { error: 'report_details_required', path: ['details'] }
  );

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.post('/', jsonBody(reportBody), async (c) => {
  const body = c.req.valid('json');

  return c.json<ReportReceipt>(
    await fileReport(c.get('db'), c.env.MAIL_QUEUE, c.get('viewer'), {
      moderatableType: body.moderatable_type,
      moderatableId: body.moderatable_id,
      category: body.category,
      details: body.details,
      locale: c.get('language')
    }),
    201
  );
});

export default app;
