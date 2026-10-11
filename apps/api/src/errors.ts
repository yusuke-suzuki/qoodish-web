import { HTTPException } from 'hono/http-exception';
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

export class ApiError extends HTTPException {
  readonly title: ErrorTitle;
  readonly detail?: string;
  readonly messageKeys: readonly MessageKey[];

  constructor(
    title: ErrorTitle,
    detail?: string,
    messageKeys: readonly MessageKey[] = []
  ) {
    super(STATUSES[title], {
      message: detail ?? [title, ...messageKeys].join(' ')
    });
    this.name = 'ApiError';
    this.title = title;
    this.detail = detail;
    this.messageKeys = messageKeys;
  }

  static fromStatus(status: number): ApiError | undefined {
    const title = (Object.keys(STATUSES) as ErrorTitle[]).find(
      (candidate) => STATUSES[candidate] === status
    );

    return title ? new ApiError(title) : undefined;
  }

  static invalid(messageKeys: readonly MessageKey[]): ApiError {
    return new ApiError('UnprocessableContent', undefined, messageKeys);
  }

  body(locale: Locale): { title: ErrorTitle; detail: string } {
    return {
      title: this.title,
      detail: this.detail ?? this.translatedDetail(locale)
    };
  }

  private translatedDetail(locale: Locale): string {
    if (this.messageKeys.length === 0) {
      return translate(locale, DEFAULT_MESSAGE_KEYS[this.title]);
    }

    return this.messageKeys
      .map((key) => translate(locale, key))
      .join(translate(locale, 'error_separator'));
  }
}
