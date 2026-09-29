export type AuthMethod = 'google.com' | 'emailLink';

export type AnalyticsEvent =
  | { name: 'sign_up' | 'login'; params: { method: AuthMethod } }
  | { name: 'email_link_sent' }
  | { name: 'link_provider' | 'unlink_provider'; params: { provider: string } }
  | { name: 'create_map'; params: { map_id: number } }
  | { name: 'create_pin'; params: { map_id: number } }
  | { name: 'start_journey' | 'finish_journey'; params: { map_id?: number } }
  | { name: 'create_chapter'; params: { map_id: number } }
  | { name: 'publish_chapter'; params: { chapter_id: number } }
  | {
      name: 'add_comment';
      params: { content_type: 'pin' | 'chapter'; item_id: number };
    }
  | {
      name: 'like';
      params: { content_type: 'pin' | 'chapter' | 'comment'; item_id: number };
    }
  | {
      name: 'follow';
      params:
        | { content_type: 'map'; item_id: number }
        | { content_type: 'journal' };
    }
  | {
      name: 'share';
      params: {
        method: 'copy_link';
        content_type: 'map' | 'pin' | 'chapter';
        item_id: number;
      };
    };

export type AnalyticsDataPoint = {
  indexes: [string];
  blobs: [string, string, string, string];
  doubles: [number, number, number];
};

const EVENT_NAMES = new Set<string>([
  'sign_up',
  'login',
  'email_link_sent',
  'link_provider',
  'unlink_provider',
  'create_map',
  'create_pin',
  'start_journey',
  'finish_journey',
  'create_chapter',
  'publish_chapter',
  'add_comment',
  'like',
  'follow',
  'share'
]);

const STRING_PARAMS: Record<string, (value: string) => boolean> = {
  content_type: (value) =>
    ['map', 'pin', 'chapter', 'comment', 'journal'].includes(value),
  method: (value) => ['google.com', 'emailLink', 'copy_link'].includes(value),
  provider: (value) => /^[\w.]{1,32}$/.test(value)
};

const NUMBER_PARAMS = ['item_id', 'map_id', 'chapter_id'] as const;

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isValidParams(params: unknown): params is Record<string, unknown> {
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    return false;
  }

  return Object.entries(params).every(([key, value]) => {
    if (key in STRING_PARAMS) {
      return typeof value === 'string' && STRING_PARAMS[key](value);
    }
    if ((NUMBER_PARAMS as readonly string[]).includes(key)) {
      return isId(value);
    }
    return false;
  });
}

export function toDataPoint(payload: unknown): AnalyticsDataPoint | null {
  if (typeof payload !== 'object' || payload === null) return null;

  const { name, params = {} } = payload as { name?: unknown; params?: unknown };

  if (typeof name !== 'string' || !EVENT_NAMES.has(name)) return null;
  if (!isValidParams(params)) return null;

  const text = (key: string) =>
    typeof params[key] === 'string' ? params[key] : '';
  const id = (key: (typeof NUMBER_PARAMS)[number]) =>
    isId(params[key]) ? params[key] : 0;

  return {
    indexes: [name],
    blobs: [name, text('content_type'), text('method'), text('provider')],
    doubles: [id('item_id'), id('map_id'), id('chapter_id')]
  };
}
