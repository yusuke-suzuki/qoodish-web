import type {
  ModeratableType,
  ReportCategory,
  ReportReceipt
} from '@qoodish/api-contract';
import { and, asc, eq, gte, inArray, ne, notExists, sql } from 'drizzle-orm';
import {
  currentTimestamp,
  type Database,
  generatedId,
  selected
} from './db/client.ts';
import {
  chapterRevisionImages,
  chapters,
  comments,
  images,
  journals,
  mapRevisionImages,
  maps,
  moderationDecisions,
  pinRevisionImages,
  pins,
  reports,
  users
} from './db/schema.ts';
import { ApiError } from './errors.ts';
import type { Locale } from './i18n/index.ts';
import { enqueueMails, type MailMessage } from './mail.ts';
import { present } from './routing.ts';
import { truncate } from './text.ts';
import {
  referenceableChapter,
  referenceableMap,
  referenceablePin,
  type Viewer,
  visible
} from './visibility.ts';

export const REPORT_CATEGORIES = [
  'spam',
  'harassment',
  'hate',
  'sexual',
  'violence',
  'illegal',
  'privacy',
  'copyright',
  'impersonation',
  'other'
] as const satisfies readonly ReportCategory[];

export const DETAILS_REQUIRED_CATEGORIES: readonly ReportCategory[] = [
  'copyright',
  'privacy',
  'other'
];

export const MAX_REPORT_DETAILS_LENGTH = 2000;

const MAX_CONTENT_SNAPSHOT_LENGTH = 1000;

export const MODERATABLE_TYPES = [
  'Pin',
  'Comment',
  'Map',
  'Chapter',
  'Journal',
  'User'
] as const satisfies readonly ModeratableType[];

type ReportedContent = {
  authorId: number;
  currentRevisionId: number | null;
  body: string;
  imageUrls: string[];
};

function urls(rows: readonly { url: string }[]): string[] {
  return rows.map((row) => row.url);
}

async function reportedPin(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<ReportedContent | undefined> {
  const [[pin], pinImages] = await db.batch([
    db
      .select({
        authorId: pins.userId,
        currentRevisionId: pins.currentRevisionId,
        name: pins.name,
        comment: pins.comment
      })
      .from(pins)
      .where(and(eq(pins.id, id), referenceablePin(viewer))),
    db
      .select({ url: images.url })
      .from(pins)
      .innerJoin(
        pinRevisionImages,
        eq(pinRevisionImages.pinRevisionId, pins.currentRevisionId)
      )
      .innerJoin(images, eq(images.id, pinRevisionImages.imageId))
      .where(eq(pins.id, id))
      .orderBy(asc(images.id))
  ]);

  return (
    pin && {
      ...pin,
      body: [pin.name, pin.comment].join('\n'),
      imageUrls: urls(pinImages)
    }
  );
}

async function reportedComment(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<ReportedContent | undefined> {
  const [comment] = await db
    .select({
      authorId: comments.userId,
      currentRevisionId: comments.currentRevisionId,
      body: comments.body
    })
    .from(comments)
    .where(
      and(
        eq(comments.id, id),
        ne(comments.status, 'deleted'),
        visible(comments.id, 'Comment'),
        eq(comments.commentableType, 'Pin'),
        inArray(
          comments.commentableId,
          db.select({ id: pins.id }).from(pins).where(referenceablePin(viewer))
        )
      )
    );

  return comment && { ...comment, imageUrls: [] };
}

async function reportedMap(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<ReportedContent | undefined> {
  const [[map], mapImages] = await db.batch([
    db
      .select({
        authorId: maps.userId,
        currentRevisionId: maps.currentRevisionId,
        name: maps.name,
        description: maps.description
      })
      .from(maps)
      .where(and(eq(maps.id, id), referenceableMap(viewer))),
    db
      .select({ url: images.url })
      .from(maps)
      .innerJoin(
        mapRevisionImages,
        eq(mapRevisionImages.mapRevisionId, maps.currentRevisionId)
      )
      .innerJoin(images, eq(images.id, mapRevisionImages.imageId))
      .where(eq(maps.id, id))
      .orderBy(asc(images.id))
  ]);

  return (
    map && {
      ...map,
      body: [map.name, map.description].join('\n'),
      imageUrls: urls(mapImages)
    }
  );
}

async function reportedChapter(
  db: Database,
  viewer: Viewer,
  id: number
): Promise<ReportedContent | undefined> {
  const [[chapter], chapterImages] = await db.batch([
    db
      .select({
        authorId: chapters.userId,
        currentRevisionId: chapters.currentRevisionId,
        title: chapters.title,
        text: sql<
          string | null
        >`(SELECT group_concat(value, ' ') FROM (SELECT value FROM json_tree(${chapters.content}) WHERE key = 'text' ORDER BY id))`
      })
      .from(chapters)
      .where(and(eq(chapters.id, id), referenceableChapter(viewer))),
    db
      .select({ url: images.url })
      .from(chapters)
      .innerJoin(
        chapterRevisionImages,
        eq(chapterRevisionImages.chapterRevisionId, chapters.currentRevisionId)
      )
      .innerJoin(images, eq(images.id, chapterRevisionImages.imageId))
      .where(eq(chapters.id, id))
      .orderBy(asc(images.id))
  ]);

  return (
    chapter && {
      ...chapter,
      body: [chapter.title, chapter.text ?? ''].join('\n'),
      imageUrls: urls(chapterImages)
    }
  );
}

async function reportedJournal(
  db: Database,
  id: number
): Promise<ReportedContent | undefined> {
  const [journal] = await db
    .select({
      authorId: journals.userId,
      currentRevisionId: journals.currentRevisionId,
      title: journals.title,
      description: journals.description
    })
    .from(journals)
    .where(eq(journals.id, id));

  return (
    journal && {
      ...journal,
      body: [journal.title, journal.description ?? ''].join('\n'),
      imageUrls: []
    }
  );
}

async function reportedUser(
  db: Database,
  id: number
): Promise<ReportedContent | undefined> {
  const [user] = await db
    .select({
      authorId: users.id,
      currentRevisionId: users.currentRevisionId,
      name: users.name,
      biography: users.biography,
      imageUrl: images.url
    })
    .from(users)
    .leftJoin(images, eq(images.id, users.imageId))
    .where(eq(users.id, id));

  return (
    user && {
      ...user,
      body: [user.name ?? '', user.biography ?? ''].join('\n'),
      imageUrls: user.imageUrl === null ? [] : [user.imageUrl]
    }
  );
}

function reportedContent(
  db: Database,
  viewer: Viewer,
  type: ModeratableType,
  id: number
): Promise<ReportedContent | undefined> {
  switch (type) {
    case 'Pin':
      return reportedPin(db, viewer, id);
    case 'Comment':
      return reportedComment(db, viewer, id);
    case 'Map':
      return reportedMap(db, viewer, id);
    case 'Chapter':
      return reportedChapter(db, viewer, id);
    case 'Journal':
      return reportedJournal(db, id);
    case 'User':
      return reportedUser(db, id);
  }
}

function contentSnapshot({ body, imageUrls }: ReportedContent): string | null {
  const lines = [
    truncate(body, MAX_CONTENT_SNAPSHOT_LENGTH),
    ...imageUrls
  ].filter(present);

  return lines.length > 0 ? lines.join('\n') : null;
}

export async function fileReport(
  db: Database,
  queue: Queue<MailMessage>,
  viewer: Viewer,
  input: {
    moderatableType: ModeratableType | undefined;
    moderatableId: number | undefined;
    category: ReportCategory;
    details: string | null | undefined;
    locale: Locale;
  }
): Promise<ReportReceipt> {
  const { moderatableType, moderatableId } = input;

  if (moderatableType === undefined) {
    throw new ApiError('BadRequest', undefined, ['report_type_not_supported']);
  }

  if (moderatableId === undefined) {
    throw new ApiError('NotFound');
  }

  const content = await reportedContent(
    db,
    viewer,
    moderatableType,
    moderatableId
  );

  if (content === undefined) {
    throw new ApiError('NotFound');
  }

  if (content.authorId === viewer.id) {
    throw ApiError.invalid(['report_own_content']);
  }

  const now = currentTimestamp();
  const [report] = await db
    .insert(reports)
    .select(
      db
        .select({
          id: generatedId(),
          category: selected(input.category, 'category'),
          contentSnapshot: selected(
            contentSnapshot(content),
            'content_snapshot'
          ),
          createdAt: selected(now, 'created_at'),
          details: selected(input.details ?? null, 'details'),
          locale: selected(input.locale, 'locale'),
          moderatableId: selected(moderatableId, 'moderatable_id'),
          moderatableType: selected(moderatableType, 'moderatable_type'),
          reportedRevisionId: selected(
            content.currentRevisionId,
            'reported_revision_id'
          ),
          reporterId: users.id
        })
        .from(users)
        .where(
          and(
            eq(users.id, viewer.id),
            notExists(
              pendingReportBy(db, viewer.id, moderatableType, moderatableId)
            )
          )
        )
    )
    .returning({ id: reports.id, createdAt: reports.createdAt });

  if (report === undefined) {
    throw ApiError.invalid(['duplicate_pending_report']);
  }

  await enqueueMails(queue, [
    { mail: 'report_received', reportId: report.id },
    { mail: 'report_acknowledged', reportId: report.id }
  ]);

  return {
    id: report.id,
    category: input.category,
    status: 'pending',
    created_at: report.createdAt
  };
}

function pendingReportBy(
  db: Database,
  reporterId: number,
  moderatableType: ModeratableType,
  moderatableId: number
) {
  return db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.reporterId, reporterId),
        eq(reports.moderatableType, moderatableType),
        eq(reports.moderatableId, moderatableId),
        notExists(
          db
            .select({ id: moderationDecisions.id })
            .from(moderationDecisions)
            .where(
              and(
                eq(
                  moderationDecisions.moderatableType,
                  reports.moderatableType
                ),
                eq(moderationDecisions.moderatableId, reports.moderatableId),
                gte(moderationDecisions.createdAt, reports.createdAt)
              )
            )
        )
      )
    );
}

export function detachReportsFromUser(db: Database, userId: number) {
  return [
    db
      .update(reports)
      .set({ reporterId: null })
      .where(eq(reports.reporterId, userId)),
    db
      .update(moderationDecisions)
      .set({ authorId: null })
      .where(eq(moderationDecisions.authorId, userId)),
    db
      .update(moderationDecisions)
      .set({ moderatorId: null })
      .where(eq(moderationDecisions.moderatorId, userId))
  ] as const;
}
