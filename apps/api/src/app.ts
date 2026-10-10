import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { except } from 'hono/combine';
import { HTTPException } from 'hono/http-exception';
import { languageDetector } from 'hono/language';
import type { JWTVerifyGetKey } from 'jose';
import {
  type FirebaseIdToken,
  verifyFirebaseIdToken
} from './auth/firebase.ts';
import type { Env } from './env.ts';
import { ApiError } from './errors.ts';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './i18n/index.ts';

export type Variables = {
  language: Locale;
  idToken: FirebaseIdToken;
};

export type AppEnv = { Bindings: Env; Variables: Variables };

export type AppOptions = {
  firebaseKeys?: JWTVerifyGetKey;
};

const PUBLIC_PATHS = ['/', '/healthcheck', '/guest/*', '/admin/*'];

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

  app.use(
    '*',
    except(
      PUBLIC_PATHS,
      bearerAuth({
        verifyToken: async (token, c) => {
          const idToken = await verifyFirebaseIdToken(
            token,
            c.env.GOOGLE_PROJECT_ID,
            options.firebaseKeys
          );

          if (!idToken) {
            return false;
          }

          c.set('idToken', idToken);
          return true;
        }
      })
    )
  );

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
      const apiError = ApiError.fromStatus(error.status);

      return c.json(apiError.body(locale), apiError.status);
    }

    console.error(error);
    const internal = new ApiError('InternalServerError');

    return c.json(internal.body(locale), internal.status);
  });

  return app;
}
