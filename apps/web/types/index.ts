import type {
  Chapter as ApiChapter,
  ChapterDetail as ApiChapterDetail,
  GuestChapter as ApiGuestChapter,
  GuestChapterDetail as ApiGuestChapterDetail,
  Comment,
  GuestComment
} from '@qoodish/api-contract';
import type { SerializedEditorState } from 'lexical';

export type {
  ApiCursorPage,
  ApiError,
  AppMap,
  BlockedAccount,
  ChapterAuthor,
  ChapterComment,
  ChapterStatus,
  Coauthor,
  CoauthorshipInvitation,
  CoauthorshipInvitationStatus,
  Comment,
  GuestChapterAuthor,
  GuestCoauthor,
  GuestComment,
  GuestMap,
  GuestPin,
  GuestPinComment,
  GuestUserProfile,
  Image,
  ImageUpload,
  ImageVariants,
  Journal,
  JournalRef,
  Journey,
  JourneyCheckin,
  JourneySummary,
  MapFeature,
  MapFeatureCollection,
  MapFeatureProperties,
  MapRef,
  Milestone,
  ModeratableType,
  MutedAccount,
  Notifiable,
  NotifiableType,
  NotificationGroup as Notification,
  NotificationKey,
  Pin,
  PinComment,
  PinProperty,
  PinPropertyOption,
  PointGeometry,
  PostAuthor,
  PreferencesUpdate,
  Profile,
  PublicUser,
  ReportCategory,
  ReportReceipt,
  Spot,
  UserProfile,
  UserSummary,
  WebPushPreferences
} from '@qoodish/api-contract';

export type Chapter = ApiChapter<SerializedEditorState>;

export type ChapterDetail = ApiChapterDetail<SerializedEditorState>;

export type GuestChapter = ApiGuestChapter<SerializedEditorState>;

export type GuestChapterDetail = ApiGuestChapterDetail<SerializedEditorState>;

export type CommentItem = GuestComment & Partial<Pick<Comment, 'liked'>>;

export type AutocompleteOption = {
  label: string;
  value: string;
};

export type ContentRef = {
  type: 'pin' | 'chapter';
  id: number;
};

export type SearchResultType = 'map' | 'chapter' | 'pin' | 'user';

export type SearchResult = {
  type: SearchResultType;
  id: number;
  name: string;
  detail: string | null;
  avatar: string | undefined;
  href: string;
};

export type JourneyPathPoint = {
  latitude: number;
  longitude: number;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
