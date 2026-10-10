import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { languageDetector } from 'hono/language';
import type { JWTVerifyGetKey } from 'jose';
import {
  bearerToken,
  type FirebaseIdToken,
  verifyFirebaseIdToken
} from './auth/firebase.ts';
import type { Env } from './env.ts';
import { ApiError } from './errors.ts';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './i18n/index.ts';

export type Variables = {
  language: Locale;
  idToken: FirebaseIdToken | null;
};

export type AppEnv = { Bindings: Env; Variables: Variables };

export type AppOptions = {
  firebaseKeys?: JWTVerifyGetKey;
};

export function createApp(options: AppOptions = {}) {
  const app = new Hono<AppEnv>();

  app.use(
    '*',
    languageDetector({
      order: ['header'],
      supportedLanguages: [...LOCALES],
      fallbackLanguage: DEFAULT_LOCALE,
      caches: false
    })
  );

  app.use('*', async (c, next) => {
    const token = bearerToken(c.req.header('authorization'));
    const idToken = token
      ? await verifyFirebaseIdToken(
          token,
          c.env.GOOGLE_PROJECT_ID,
          options.firebaseKeys
        )
      : null;

    c.set('idToken', idToken);
    await next();
  });

  app.get('/healthcheck', (c) => c.text('ok'));
  app.get('/', (c) => c.text('ok'));

  app.notFound((c) => {
    const error = new ApiError(
      'NotFound',
      `No route matches [${c.req.method}] '${c.req.path}'`
    );

    return c.json(error.body(c.get('language')), error.status);
  });

  app.onError((error, c) => {
    const locale = c.get('language');

    if (error instanceof ApiError) {
      if (error.status >= 500) {
        console.error(error);
      }

      return c.json(error.body(locale), error.status);
    }

    if (error instanceof HTTPException) {
      const apiError =
        error.status === 401
          ? new ApiError('Unauthorized')
          : new ApiError('BadRequest', error.message || undefined);

      return c.json(apiError.body(locale), apiError.status);
    }

    console.error(error);
    const internal = new ApiError('InternalServerError');

    return c.json(internal.body(locale), internal.status);
  });

  return app;
}

export function currentIdToken(
  variables: Pick<Variables, 'idToken'>
): FirebaseIdToken {
  if (!variables.idToken) {
    throw new ApiError('Unauthorized');
  }

  return variables.idToken;
}
