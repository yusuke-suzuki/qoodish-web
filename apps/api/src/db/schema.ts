import { sql } from 'drizzle-orm';
import {
  type AnySQLiteColumn,
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    biography: text('biography'),
    createdAt: text('created_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => userRevisions.id,
      { onDelete: 'set null' }
    ),
    email: text('email'),
    imageId: integer('image_id').references((): AnySQLiteColumn => images.id, {
      onDelete: 'set null'
    }),
    locale: text('locale'),
    name: text('name'),
    uid: text('uid').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_users_on_uid').on(t.uid),
    index('index_users_on_current_revision_id').on(t.currentRevisionId),
    index('index_users_on_image_id').on(t.imageId)
  ]
);

export const userRevisions = sqliteTable(
  'user_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    biography: text('biography'),
    createdAt: text('created_at').notNull(),
    name: text('name'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_user_revisions_on_user_id_and_id').on(t.userId, t.id),
    index('index_user_revisions_on_user_id').on(t.userId)
  ]
);

export const images = sqliteTable(
  'images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    url: text('url').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    uniqueIndex('index_images_on_url').on(t.url),
    index('index_images_on_user_id').on(t.userId)
  ]
);

export const userPreferences = sqliteTable(
  'user_preferences',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    webPush: text('web_push').notNull()
  },
  (t) => [
    index('index_user_preferences_on_user_id').on(t.userId),
    check('user_preferences_web_push_json', sql`json_valid(${t.webPush})`)
  ]
);

export const devices = sqliteTable(
  'devices',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    registrationToken: text('registration_token').notNull(),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id').notNull()
  },
  (t) => [
    uniqueIndex('index_devices_on_user_id_and_registration_token').on(
      t.userId,
      t.registrationToken
    ),
    index('index_devices_on_registration_token').on(t.registrationToken),
    index('index_devices_on_user_id').on(t.userId)
  ]
);

export const blocks = sqliteTable(
  'blocks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    blockedId: integer('blocked_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blockerId: integer('blocker_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull()
  },
  (t) => [
    index('index_blocks_on_blocked_id').on(t.blockedId),
    index('index_blocks_on_blocker_id_and_blocked_id').on(
      t.blockerId,
      t.blockedId
    )
  ]
);

export const unblocks = sqliteTable(
  'unblocks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    blockId: integer('block_id')
      .notNull()
      .references(() => blocks.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull()
  },
  (t) => [uniqueIndex('index_unblocks_on_block_id').on(t.blockId)]
);

export const mutes = sqliteTable(
  'mutes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    mutedId: integer('muted_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    muterId: integer('muter_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  },
  (t) => [
    index('index_mutes_on_muted_id').on(t.mutedId),
    index('index_mutes_on_muter_id_and_muted_id').on(t.muterId, t.mutedId)
  ]
);

export const unmutes = sqliteTable(
  'unmutes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    muteId: integer('mute_id')
      .notNull()
      .references(() => mutes.id, { onDelete: 'cascade' })
  },
  (t) => [uniqueIndex('index_unmutes_on_mute_id').on(t.muteId)]
);

export const maps = sqliteTable(
  'maps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    baseIdVal: text('base_id_val'),
    baseName: text('base_name'),
    createdAt: text('created_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => mapRevisions.id,
      { onDelete: 'set null' }
    ),
    description: text('description').notNull(),
    invitable: integer('invitable', { mode: 'boolean' }).default(false),
    latitude: real('latitude').notNull().default(0),
    longitude: real('longitude').notNull().default(0),
    name: text('name').notNull(),
    private: integer('private', { mode: 'boolean' }).default(true),
    shared: integer('shared', { mode: 'boolean' }).default(false),
    status: text('status').notNull().default('published'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_maps_on_current_revision_id').on(t.currentRevisionId),
    index('index_maps_on_status_and_created_at').on(t.status, t.createdAt),
    index('index_maps_on_user_id').on(t.userId)
  ]
);

export const mapRevisions = sqliteTable(
  'map_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    description: text('description').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    mapId: integer('map_id')
      .notNull()
      .references(() => maps.id),
    name: text('name').notNull(),
    private: integer('private', { mode: 'boolean' }).notNull().default(true),
    status: text('status').notNull().default('published'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id').references(() => users.id)
  },
  (t) => [
    index('index_map_revisions_on_map_id_and_id').on(t.mapId, t.id),
    index('index_map_revisions_on_map_id').on(t.mapId),
    index('index_map_revisions_on_user_id').on(t.userId)
  ]
);

export const mapRevisionImages = sqliteTable(
  'map_revision_images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id),
    mapRevisionId: integer('map_revision_id')
      .notNull()
      .references(() => mapRevisions.id),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_map_revision_images_on_map_revision_id_and_image_id').on(
      t.mapRevisionId,
      t.imageId
    ),
    index('index_map_revision_images_on_image_id').on(t.imageId),
    index('index_map_revision_images_on_map_revision_id').on(t.mapRevisionId)
  ]
);

export const featuredMaps = sqliteTable(
  'featured_maps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    mapId: integer('map_id')
      .notNull()
      .references(() => maps.id),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    index('index_featured_maps_on_created_at_and_map_id').on(
      t.createdAt,
      t.mapId
    ),
    index('index_featured_maps_on_map_id').on(t.mapId)
  ]
);

export const bookmarks = sqliteTable(
  'bookmarks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    mapId: integer('map_id')
      .notNull()
      .references(() => maps.id),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    uniqueIndex('index_bookmarks_on_map_id_and_user_id').on(t.mapId, t.userId),
    index('index_bookmarks_on_map_id').on(t.mapId),
    index('index_bookmarks_on_user_id').on(t.userId)
  ]
);

export const coauthorships = sqliteTable(
  'coauthorships',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    mapId: integer('map_id')
      .notNull()
      .references(() => maps.id),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    uniqueIndex('index_coauthorships_on_map_id_and_user_id').on(
      t.mapId,
      t.userId
    ),
    index('index_coauthorships_on_map_id').on(t.mapId),
    index('index_coauthorships_on_user_id').on(t.userId)
  ]
);

export const coauthorshipInvitations = sqliteTable(
  'coauthorship_invitations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    inviteeId: integer('invitee_id')
      .notNull()
      .references(() => users.id),
    inviterId: integer('inviter_id')
      .notNull()
      .references(() => users.id),
    mapId: integer('map_id')
      .notNull()
      .references(() => maps.id),
    status: integer('status').notNull().default(0),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    index('index_coauthorship_invitations_on_invitee_id_and_status').on(
      t.inviteeId,
      t.status
    ),
    index('index_coauthorship_invitations_on_invitee_id').on(t.inviteeId),
    index('index_coauthorship_invitations_on_inviter_id').on(t.inviterId),
    index('index_coauthorship_invitations_on_map_id_and_invitee_id').on(
      t.mapId,
      t.inviteeId
    ),
    index('index_coauthorship_invitations_on_map_id').on(t.mapId)
  ]
);

export const pins = sqliteTable(
  'pins',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    comment: text('comment').notNull(),
    createdAt: text('created_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => pinRevisions.id,
      { onDelete: 'set null' }
    ),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    mapId: integer('map_id')
      .notNull()
      .references(() => maps.id),
    name: text('name').notNull(),
    spotId: integer('spot_id'),
    status: text('status').notNull().default('published'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_pins_on_created_at').on(t.createdAt),
    index('index_pins_on_current_revision_id').on(t.currentRevisionId),
    index('index_pins_on_map_id').on(t.mapId),
    index('index_pins_on_status_and_created_at').on(t.status, t.createdAt),
    index('index_pins_on_user_id').on(t.userId)
  ]
);

export const pinRevisions = sqliteTable(
  'pin_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    comment: text('comment').notNull(),
    createdAt: text('created_at').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    name: text('name').notNull(),
    pinId: integer('pin_id')
      .notNull()
      .references(() => pins.id),
    status: text('status').notNull().default('published'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_pin_revisions_on_pin_id_and_id').on(t.pinId, t.id),
    index('index_pin_revisions_on_pin_id').on(t.pinId),
    index('index_pin_revisions_on_user_id').on(t.userId)
  ]
);

export const pinRevisionImages = sqliteTable(
  'pin_revision_images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id),
    pinRevisionId: integer('pin_revision_id')
      .notNull()
      .references(() => pinRevisions.id),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_pin_revision_images_on_pin_revision_id_and_image_id').on(
      t.pinRevisionId,
      t.imageId
    ),
    index('index_pin_revision_images_on_image_id').on(t.imageId),
    index('index_pin_revision_images_on_pin_revision_id').on(t.pinRevisionId)
  ]
);

export const pinProperties = sqliteTable(
  'pin_properties',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    mapId: integer('map_id')
      .notNull()
      .references(() => maps.id),
    name: text('name').notNull(),
    position: integer('position').notNull().default(0),
    multiple: integer('multiple', { mode: 'boolean' }).notNull().default(false),
    status: text('status').notNull().default('published'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => pinPropertyRevisions.id,
      { onDelete: 'set null' }
    )
  },
  (t) => [
    index('index_pin_properties_on_map_id').on(t.mapId),
    index('index_pin_properties_on_current_revision_id').on(t.currentRevisionId)
  ]
);

export const pinPropertyRevisions = sqliteTable(
  'pin_property_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pinPropertyId: integer('pin_property_id')
      .notNull()
      .references(() => pinProperties.id),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'set null'
    }),
    name: text('name').notNull(),
    position: integer('position').notNull(),
    status: text('status').notNull().default('published'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    index('index_pin_property_revisions_on_pin_property_id').on(
      t.pinPropertyId
    ),
    index('index_pin_property_revisions_on_user_id').on(t.userId),
    index('index_pin_property_revisions_on_pin_property_id_and_id').on(
      t.pinPropertyId,
      t.id
    )
  ]
);

export const pinPropertyOptions = sqliteTable(
  'pin_property_options',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pinPropertyId: integer('pin_property_id')
      .notNull()
      .references(() => pinProperties.id),
    name: text('name').notNull(),
    position: integer('position').notNull().default(0),
    status: text('status').notNull().default('published'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => pinPropertyOptionRevisions.id,
      { onDelete: 'set null' }
    )
  },
  (t) => [
    index('index_pin_property_options_on_pin_property_id').on(t.pinPropertyId),
    index('index_pin_property_options_on_current_revision_id').on(
      t.currentRevisionId
    )
  ]
);

export const pinPropertyOptionRevisions = sqliteTable(
  'pin_property_option_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pinPropertyOptionId: integer('pin_property_option_id')
      .notNull()
      .references(() => pinPropertyOptions.id),
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'set null'
    }),
    name: text('name').notNull(),
    position: integer('position').notNull(),
    status: text('status').notNull().default('published'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    index('index_pin_property_option_revisions_on_pin_property_option_id').on(
      t.pinPropertyOptionId
    ),
    index('index_pin_property_option_revisions_on_user_id').on(t.userId),
    index('idx_on_pin_property_option_id_id_cd060b3bcd').on(
      t.pinPropertyOptionId,
      t.id
    )
  ]
);

export const pinRevisionPropertyOptions = sqliteTable(
  'pin_revision_property_options',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pinRevisionId: integer('pin_revision_id')
      .notNull()
      .references(() => pinRevisions.id),
    pinPropertyOptionId: integer('pin_property_option_id')
      .notNull()
      .references(() => pinPropertyOptions.id),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('idx_on_pin_revision_id_pin_property_option_id_e17f1d524a').on(
      t.pinRevisionId,
      t.pinPropertyOptionId
    ),
    index('index_pin_revision_property_options_on_pin_revision_id').on(
      t.pinRevisionId
    ),
    index('index_pin_revision_property_options_on_pin_property_option_id').on(
      t.pinPropertyOptionId
    )
  ]
);

export const journeys = sqliteTable(
  'journeys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    encodedPath: text('encoded_path'),
    finishedAt: text('finished_at'),
    mapId: integer('map_id').references(() => maps.id),
    startedAt: text('started_at'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_journeys_on_map_id').on(t.mapId),
    index('index_journeys_on_user_id_and_map_id_and_finished_at').on(
      t.userId,
      t.mapId,
      t.finishedAt
    )
  ]
);

export const milestones = sqliteTable(
  'milestones',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    journeyId: integer('journey_id')
      .notNull()
      .references(() => journeys.id),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    name: text('name').notNull(),
    pinId: integer('pin_id').references(() => pins.id),
    position: integer('position').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_milestones_on_journey_id_and_pin_id').on(
      t.journeyId,
      t.pinId
    ),
    index('index_milestones_on_journey_id_and_position').on(
      t.journeyId,
      t.position
    ),
    index('index_milestones_on_pin_id').on(t.pinId)
  ]
);

export const journeyCheckins = sqliteTable(
  'journey_checkins',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    checkedInAt: text('checked_in_at').notNull(),
    createdAt: text('created_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => journeyCheckinRevisions.id,
      { onDelete: 'set null' }
    ),
    journeyId: integer('journey_id')
      .notNull()
      .references(() => journeys.id),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    name: text('name').notNull(),
    note: text('note'),
    pinId: integer('pin_id').references(() => pins.id),
    status: text('status').notNull().default('recorded'),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_journey_checkins_on_journey_id_and_pin_id').on(
      t.journeyId,
      t.pinId
    ),
    index('index_journey_checkins_on_current_revision_id').on(
      t.currentRevisionId
    ),
    index('index_journey_checkins_on_pin_id').on(t.pinId)
  ]
);

export const journeyCheckinRevisions = sqliteTable(
  'journey_checkin_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    checkedInAt: text('checked_in_at').notNull(),
    createdAt: text('created_at').notNull(),
    journeyCheckinId: integer('journey_checkin_id')
      .notNull()
      .references(() => journeyCheckins.id),
    note: text('note'),
    status: text('status').notNull().default('recorded'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_journey_checkin_revisions_on_journey_checkin_id_and_id').on(
      t.journeyCheckinId,
      t.id
    ),
    index('index_journey_checkin_revisions_on_journey_checkin_id').on(
      t.journeyCheckinId
    ),
    index('index_journey_checkin_revisions_on_user_id').on(t.userId)
  ]
);

export const journeyCheckinRevisionImages = sqliteTable(
  'journey_checkin_revision_images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id),
    journeyCheckinRevisionId: integer('journey_checkin_revision_id')
      .notNull()
      .references(() => journeyCheckinRevisions.id),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_checkin_revision_images_on_revision_id_and_image_id').on(
      t.journeyCheckinRevisionId,
      t.imageId
    ),
    index('index_journey_checkin_revision_images_on_image_id').on(t.imageId),
    index('idx_on_journey_checkin_revision_id_79ea77d6c2').on(
      t.journeyCheckinRevisionId
    )
  ]
);

export const journals = sqliteTable(
  'journals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => journalRevisions.id,
      { onDelete: 'set null' }
    ),
    description: text('description'),
    title: text('title').notNull(),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    uniqueIndex('index_journals_on_user_id').on(t.userId),
    index('index_journals_on_current_revision_id').on(t.currentRevisionId)
  ]
);

export const journalRevisions = sqliteTable(
  'journal_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    description: text('description'),
    journalId: integer('journal_id')
      .notNull()
      .references(() => journals.id),
    title: text('title').notNull(),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_journal_revisions_on_journal_id_and_id').on(t.journalId, t.id),
    index('index_journal_revisions_on_journal_id').on(t.journalId),
    index('index_journal_revisions_on_user_id').on(t.userId)
  ]
);

export const journalBookmarks = sqliteTable(
  'journal_bookmarks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    journalId: integer('journal_id')
      .notNull()
      .references(() => journals.id),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    uniqueIndex('index_journal_bookmarks_on_journal_id_and_user_id').on(
      t.journalId,
      t.userId
    ),
    index('index_journal_bookmarks_on_journal_id').on(t.journalId),
    index('index_journal_bookmarks_on_user_id').on(t.userId)
  ]
);

export const chapters = sqliteTable(
  'chapters',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    content: text('content').notNull(),
    contentText: text('content_text'),
    createdAt: text('created_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => chapterRevisions.id,
      { onDelete: 'set null' }
    ),
    journeyId: integer('journey_id').references(() => journeys.id),
    mapFeatures: text('map_features').notNull(),
    mapId: integer('map_id').references(() => maps.id),
    status: text('status').notNull().default('draft'),
    title: text('title').notNull(),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    uniqueIndex('index_chapters_on_journey_id').on(t.journeyId),
    index('index_chapters_on_current_revision_id').on(t.currentRevisionId),
    index('index_chapters_on_map_id').on(t.mapId),
    index('index_chapters_on_status_and_created_at').on(t.status, t.createdAt),
    index('index_chapters_on_user_id_and_status').on(t.userId, t.status),
    check('chapters_content_json', sql`json_valid(${t.content})`),
    check('chapters_map_features_json', sql`json_valid(${t.mapFeatures})`)
  ]
);

export const chapterRevisions = sqliteTable(
  'chapter_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chapterId: integer('chapter_id')
      .notNull()
      .references(() => chapters.id),
    content: text('content').notNull(),
    createdAt: text('created_at').notNull(),
    mapFeatures: text('map_features').notNull(),
    status: text('status').notNull().default('draft'),
    title: text('title').notNull(),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_chapter_revisions_on_chapter_id_and_id').on(t.chapterId, t.id),
    index('index_chapter_revisions_on_chapter_id').on(t.chapterId),
    index('index_chapter_revisions_on_user_id').on(t.userId),
    check('chapter_revisions_content_json', sql`json_valid(${t.content})`),
    check(
      'chapter_revisions_map_features_json',
      sql`json_valid(${t.mapFeatures})`
    )
  ]
);

export const chapterRevisionImages = sqliteTable(
  'chapter_revision_images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chapterRevisionId: integer('chapter_revision_id')
      .notNull()
      .references(() => chapterRevisions.id),
    createdAt: text('created_at').notNull(),
    imageId: integer('image_id')
      .notNull()
      .references(() => images.id),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('idx_on_chapter_revision_id_image_id_9e3b64d6f1').on(
      t.chapterRevisionId,
      t.imageId
    ),
    index('index_chapter_revision_images_on_chapter_revision_id').on(
      t.chapterRevisionId
    ),
    index('index_chapter_revision_images_on_image_id').on(t.imageId)
  ]
);

export const comments = sqliteTable(
  'comments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    body: text('body').notNull(),
    commentableId: integer('commentable_id').notNull(),
    commentableType: text('commentable_type').notNull(),
    createdAt: text('created_at').notNull(),
    currentRevisionId: integer('current_revision_id').references(
      (): AnySQLiteColumn => commentRevisions.id,
      { onDelete: 'set null' }
    ),
    status: text('status').notNull().default('published'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id').notNull()
  },
  (t) => [
    index('index_comments_on_commentable_type_and_commentable_id').on(
      t.commentableType,
      t.commentableId
    ),
    index('index_comments_on_current_revision_id').on(t.currentRevisionId),
    index('index_comments_on_user_id').on(t.userId)
  ]
);

export const commentRevisions = sqliteTable(
  'comment_revisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    body: text('body').notNull(),
    commentId: integer('comment_id')
      .notNull()
      .references(() => comments.id),
    createdAt: text('created_at').notNull(),
    status: text('status').notNull().default('published'),
    updatedAt: text('updated_at').notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id)
  },
  (t) => [
    index('index_comment_revisions_on_comment_id_and_id').on(t.commentId, t.id),
    index('index_comment_revisions_on_comment_id').on(t.commentId),
    index('index_comment_revisions_on_user_id').on(t.userId)
  ]
);

export const votes = sqliteTable(
  'votes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    votableId: integer('votable_id'),
    votableType: text('votable_type'),
    voteFlag: integer('vote_flag', { mode: 'boolean' }),
    voteScope: text('vote_scope'),
    voteWeight: integer('vote_weight'),
    voterId: integer('voter_id'),
    voterType: text('voter_type')
  },
  (t) => [
    uniqueIndex('index_votes_on_votable_and_voter').on(
      t.votableType,
      t.votableId,
      t.voterType,
      t.voterId
    ),
    index('index_votes_on_votable_id_and_votable_type_and_vote_scope').on(
      t.votableId,
      t.votableType,
      t.voteScope
    ),
    index('index_votes_on_votable_type_and_votable_id').on(
      t.votableType,
      t.votableId
    ),
    index('index_votes_on_voter_id_and_voter_type_and_vote_scope').on(
      t.voterId,
      t.voterType,
      t.voteScope
    ),
    index('index_votes_on_voter_type_and_voter_id').on(t.voterType, t.voterId)
  ]
);

export const notifications = sqliteTable(
  'notifications',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    key: text('key'),
    notifiableId: integer('notifiable_id'),
    notifiableType: text('notifiable_type'),
    notifierId: integer('notifier_id'),
    notifierType: text('notifier_type'),
    read: integer('read', { mode: 'boolean' }).default(false),
    recipientId: integer('recipient_id'),
    recipientType: text('recipient_type'),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    index('index_notifications_on_notifiable_id_and_notifiable_type').on(
      t.notifiableId,
      t.notifiableType
    ),
    index('index_notifications_on_notifiable_type_and_notifiable_id').on(
      t.notifiableType,
      t.notifiableId
    ),
    index('index_notifications_on_notifier_id_and_notifier_type').on(
      t.notifierId,
      t.notifierType
    ),
    index('index_notifications_on_notifier_type_and_notifier_id').on(
      t.notifierType,
      t.notifierId
    ),
    index('index_notifications_on_recipient_id_and_recipient_type').on(
      t.recipientId,
      t.recipientType
    ),
    index('index_notifications_on_recipient_type_and_recipient_id').on(
      t.recipientType,
      t.recipientId
    )
  ]
);

export const staffMembers = sqliteTable(
  'staff_members',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    email: text('email').notNull(),
    revokedAt: text('revoked_at'),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [uniqueIndex('index_staff_members_on_email').on(t.email)]
);

export const roles = sqliteTable(
  'roles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    description: text('description'),
    name: text('name').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [uniqueIndex('index_roles_on_name').on(t.name)]
);

export const rolePermissions = sqliteTable(
  'role_permissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    permission: text('permission').notNull(),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_role_permissions_on_role_id_and_permission').on(
      t.roleId,
      t.permission
    )
  ]
);

export const staffMemberRoles = sqliteTable(
  'staff_member_roles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdAt: text('created_at').notNull(),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id),
    staffMemberId: integer('staff_member_id')
      .notNull()
      .references(() => staffMembers.id),
    updatedAt: text('updated_at').notNull()
  },
  (t) => [
    uniqueIndex('index_staff_member_roles_on_staff_member_id_and_role_id').on(
      t.staffMemberId,
      t.roleId
    ),
    index('index_staff_member_roles_on_role_id').on(t.roleId)
  ]
);

export const reports = sqliteTable(
  'reports',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    category: text('category').notNull(),
    contentSnapshot: text('content_snapshot'),
    createdAt: text('created_at').notNull(),
    details: text('details'),
    locale: text('locale').notNull(),
    moderatableId: integer('moderatable_id').notNull(),
    moderatableType: text('moderatable_type').notNull(),
    reportedRevisionId: integer('reported_revision_id'),
    reporterId: integer('reporter_id').references(() => users.id)
  },
  (t) => [
    index('index_reports_on_moderatable').on(
      t.moderatableType,
      t.moderatableId
    ),
    index('index_reports_on_reporter_id').on(t.reporterId)
  ]
);

export const moderationDecisions = sqliteTable(
  'moderation_decisions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    authorId: integer('author_id').references(() => users.id),
    contentSnapshot: text('content_snapshot'),
    createdAt: text('created_at').notNull(),
    moderatableId: integer('moderatable_id').notNull(),
    moderatableType: text('moderatable_type').notNull(),
    moderatorId: integer('moderator_id').references(() => users.id),
    outcome: text('outcome').notNull(),
    reason: text('reason').notNull(),
    reviewedRevisionId: integer('reviewed_revision_id'),
    staffMemberId: integer('staff_member_id').references(() => staffMembers.id)
  },
  (t) => [
    index('index_moderation_decisions_on_author_id').on(t.authorId),
    index('index_moderation_decisions_on_moderatable_and_time').on(
      t.moderatableType,
      t.moderatableId,
      t.createdAt
    ),
    index('index_moderation_decisions_on_moderator_id').on(t.moderatorId),
    index('index_moderation_decisions_on_staff_member_id').on(t.staffMemberId)
  ]
);
