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

type Check = (value: unknown) => boolean;
type ParamShape = Record<string, Check>;

const oneOf =
  (...allowed: string[]): Check =>
  (value) =>
    typeof value === 'string' && allowed.includes(value);

const id: Check = (value) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const providerId: Check = (value) =>
  typeof value === 'string' && /^[\w.]{1,32}$/.test(value);

const authMethod = oneOf('google.com', 'emailLink');

const EVENT_SHAPES: Record<AnalyticsEvent['name'], ParamShape[]> = {
  sign_up: [{ method: authMethod }],
  login: [{ method: authMethod }],
  email_link_sent: [{}],
  link_provider: [{ provider: providerId }],
  unlink_provider: [{ provider: providerId }],
  create_map: [{ map_id: id }],
  create_pin: [{ map_id: id }],
  start_journey: [{ map_id: id }, {}],
  finish_journey: [{ map_id: id }, {}],
  create_chapter: [{ map_id: id }],
  publish_chapter: [{ chapter_id: id }],
  add_comment: [{ content_type: oneOf('pin', 'chapter'), item_id: id }],
  like: [{ content_type: oneOf('pin', 'chapter', 'comment'), item_id: id }],
  follow: [
    { content_type: oneOf('map'), item_id: id },
    { content_type: oneOf('journal') }
  ],
  share: [
    {
      method: oneOf('copy_link'),
      content_type: oneOf('map', 'pin', 'chapter'),
      item_id: id
    }
  ]
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function matchesShape(params: Record<string, unknown>, shape: ParamShape) {
  const keys = Object.keys(params);

  return (
    keys.length === Object.keys(shape).length &&
    keys.every((key) => Object.hasOwn(shape, key) && shape[key](params[key]))
  );
}

export function toDataPoint(payload: unknown): AnalyticsDataPoint | null {
  if (!isPlainObject(payload)) return null;

  const { name, params = {} } = payload;

  if (typeof name !== 'string' || !Object.hasOwn(EVENT_SHAPES, name)) {
    return null;
  }
  if (!isPlainObject(params)) return null;

  const shapes = EVENT_SHAPES[name as AnalyticsEvent['name']];

  if (!shapes.some((shape) => matchesShape(params, shape))) return null;

  const text = (key: string) =>
    typeof params[key] === 'string' ? params[key] : '';
  const number = (key: string) =>
    typeof params[key] === 'number' ? params[key] : 0;

  return {
    indexes: [name],
    blobs: [name, text('content_type'), text('method'), text('provider')],
    doubles: [number('item_id'), number('map_id'), number('chapter_id')]
  };
}
