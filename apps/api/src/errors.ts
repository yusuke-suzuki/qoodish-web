import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { type Locale, type MessageKey, translate } from './i18n/index.ts';

export type ErrorTitle =
  | 'BadRequest'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'Conflict'
  | 'TooManyRequests'
  | 'UnprocessableContent'
  | 'InternalServerError';

const DEFAULT_MESSAGE_KEYS: Record<ErrorTitle, MessageKey> = {
  BadRequest: 'error_400',
  Unauthorized: 'error_401',
  Forbidden: 'error_403',
  NotFound: 'error_404',
  Conflict: 'error_409',
  TooManyRequests: 'error_429',
  UnprocessableContent: 'error_422',
  InternalServerError: 'error_500'
};

const STATUSES: Record<ErrorTitle, ContentfulStatusCode> = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  Conflict: 409,
  TooManyRequests: 429,
  UnprocessableContent: 422,
  InternalServerError: 500
};

export class ApiError extends Error {
  readonly title: ErrorTitle;
  readonly status: ContentfulStatusCode;
  readonly detail?: string;

  constructor(title: ErrorTitle, detail?: string) {
    super(detail ?? title);
    this.name = 'ApiError';
    this.title = title;
    this.status = STATUSES[title];
    this.detail = detail;
  }

  body(locale: Locale): { title: ErrorTitle; detail: string } {
    return {
      title: this.title,
      detail: this.detail ?? translate(locale, DEFAULT_MESSAGE_KEYS[this.title])
    };
  }
}
