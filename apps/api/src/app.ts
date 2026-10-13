import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { except } from 'hono/combine';
import { HTTPException } from 'hono/http-exception';
import { languageDetector } from 'hono/language';
import type { JWTVerifyGetKey } from 'jose';
import type { AccessClaims } from './auth/access.ts';
import {
  type FirebaseIdToken,
  verifyFirebaseIdToken
} from './auth/firebase.ts';
import type { Database } from './db/client.ts';
import type { Env } from './env.ts';
import { ApiError } from './errors.ts';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './i18n/index.ts';
import { authenticateStaff } from './middleware/authenticate-staff.ts';
import { provideDatabase } from './middleware/provide-database.ts';
import adminReports from './routes/admin/reports.ts';
import adminRoles from './routes/admin/roles.ts';
import adminStaffMembers from './routes/admin/staff_members.ts';
import chapters from './routes/chapters.ts';
import guestChapters from './routes/guest/chapters.ts';
import guestMaps from './routes/guest/maps.ts';
import guestPins from './routes/guest/pins.ts';
import guestUsers from './routes/guest/users.ts';
import guestV2Chapters from './routes/guest/v2/chapters.ts';
import guestV2Pins from './routes/guest/v2/pins.ts';
import guestV2Users from './routes/guest/v2/users.ts';
import images from './routes/images.ts';
import journals from './routes/journals.ts';
import maps from './routes/maps.ts';
import me from './routes/me.ts';
import pins from './routes/pins.ts';
import reports from './routes/reports.ts';
import users from './routes/users.ts';
import v2Me from './routes/v2/me.ts';
import v2Pins from './routes/v2/pins.ts';
import v2Users from './routes/v2/users.ts';

export type Variables = {
  db: Database;
  language: Locale;
  idToken: FirebaseIdToken;
  accessClaims: AccessClaims;
};

export type AppEnv = { Bindings: Env; Variables: Variables };

export type AppOptions = {
  firebaseKeys?: JWTVerifyGetKey;
  accessKeys?: JWTVerifyGetKey;
};

const ID_TOKEN_EXEMPT_PATHS = ['/', '/healthcheck', '/guest/*', '/admin/*'];

export function createApp(options: AppOptions = {}) {
  const app = new Hono<AppEnv>({ strict: false });

  app.use(
    '*',
    languageDetector({
      order: ['header'],
      supportedLanguages: [...LOCALES],
      fallbackLanguage: DEFAULT_LOCALE,
      caches: false
    })
  );

  app.use('*', provideDatabase);

  app.use(
    '*',
    except(
      ID_TOKEN_EXEMPT_PATHS,
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

  app.use('/admin/*', authenticateStaff(options.accessKeys));

  app.get('/healthcheck', (c) => c.text('ok'));
  app.get('/', (c) => c.text('ok'));
  app.route('/guest/maps', guestMaps);
  app.route('/guest/pins', guestPins);
  app.route('/guest/chapters', guestChapters);
  app.route('/guest/users', guestUsers);
  app.route('/guest/v2/pins', guestV2Pins);
  app.route('/guest/v2/chapters', guestV2Chapters);
  app.route('/guest/v2/users', guestV2Users);
  app.route('/users', users);
  app.route('/maps', maps);
  app.route('/pins', pins);
  app.route('/chapters', chapters);
  app.route('/journals', journals);
  app.route('/images', images);
  app.route('/me', me);
  app.route('/reports', reports);
  app.route('/v2/pins', v2Pins);
  app.route('/v2/users', v2Users);
  app.route('/v2/me', v2Me);
  app.route('/admin/reports', adminReports);
  app.route('/admin/staff_members', adminStaffMembers);
  app.route('/admin/roles', adminRoles);

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

      if (apiError) {
        return c.json(apiError.body(locale), apiError.status);
      }

      return c.json(
        { title: 'HttpError', detail: error.message || String(error.status) },
        error.status
      );
    }

    console.error(error);
    const internal = new ApiError('InternalServerError');

    return c.json(internal.body(locale), internal.status);
  });

  return app;
}
