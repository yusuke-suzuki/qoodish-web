import { type Context, Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import { ACCESS_JWT_HEADER, hasAccess } from './access.ts';
import {
  type ApiContext,
  ApiUnavailableError,
  decideReport,
  getReport,
  listPendingReports
} from './api.ts';
import {
  dictionaryFor,
  isLocale,
  type Locale,
  preferredLocale
} from './i18n/index.ts';
import { parseDecision } from './reports.ts';
import { STYLES } from './styles.ts';
import { Message } from './views/Message.tsx';
import { type DecisionFormState, ReportDetail } from './views/ReportDetail.tsx';
import { ReportList } from './views/ReportList.tsx';

type Env = {
  API_ENDPOINT: string;
  WEB_ENDPOINT: string;
  TIME_ZONE: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
};

type AppEnv = { Bindings: Env; Variables: { assertion: string } };

const app = new Hono<AppEnv>();

app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'none'"],
      styleSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"]
    },
    referrerPolicy: 'no-referrer',
    xFrameOptions: 'DENY'
  })
);

app.use('*', async (c, next) => {
  c.header('X-Robots-Tag', 'noindex, nofollow');
  c.header('Cache-Control', 'no-store');
  await next();
});

app.use('*', async (c, next) => {
  const assertion = c.req.header(ACCESS_JWT_HEADER);
  const allowed = await hasAccess(assertion, {
    teamDomain: c.env.CF_ACCESS_TEAM_DOMAIN,
    audience: c.env.CF_ACCESS_AUD
  });

  if (!allowed || !assertion) {
    return c.text('Unauthorized', 401);
  }

  c.set('assertion', assertion);
  await next();
});

app.use('*', csrf());

function localeOf(c: Context<AppEnv>): Locale {
  const lang = c.req.param('lang');
  return isLocale(lang)
    ? lang
    : preferredLocale(c.req.header('accept-language'));
}

function apiContext(c: Context<AppEnv>, locale: Locale): ApiContext {
  return {
    endpoint: c.env.API_ENDPOINT,
    assertion: c.get('assertion'),
    locale
  };
}

function notFound(c: Context<AppEnv>, locale: Locale) {
  return c.html(
    <Message locale={locale} message={dictionaryFor(locale).notFound} />,
    404
  );
}

function forbidden(c: Context<AppEnv>, locale: Locale) {
  return c.html(
    <Message locale={locale} message={dictionaryFor(locale).forbidden} />,
    403
  );
}

function refused(c: Context<AppEnv>, locale: Locale, status: number) {
  return status === 403 ? forbidden(c, locale) : notFound(c, locale);
}

async function renderReport(
  c: Context<AppEnv>,
  locale: Locale,
  reportId: string,
  form?: DecisionFormState,
  status: 200 | 422 = 200
) {
  const result = await getReport(apiContext(c, locale), reportId);

  if (!result.ok) {
    return refused(c, locale, result.status);
  }

  return c.html(
    <ReportDetail
      locale={locale}
      timeZone={c.env.TIME_ZONE}
      webEndpoint={c.env.WEB_ENDPOINT}
      report={result.data}
      form={form}
    />,
    status
  );
}

app.get('/styles.css', (c) => {
  c.header('Content-Type', 'text/css; charset=utf-8');
  return c.body(STYLES);
});

app.get('/', (c) =>
  c.redirect(`/${preferredLocale(c.req.header('accept-language'))}/reports`)
);

app.use('/:lang/*', async (c, next) => {
  if (!isLocale(c.req.param('lang'))) {
    return notFound(c, localeOf(c));
  }

  await next();
});

app.get('/:lang', (c) =>
  isLocale(c.req.param('lang'))
    ? c.redirect(`/${c.req.param('lang')}/reports`)
    : notFound(c, localeOf(c))
);

app.get('/:lang/reports', async (c) => {
  const locale = localeOf(c);
  const result = await listPendingReports(apiContext(c, locale));

  if (!result.ok) {
    return refused(c, locale, result.status);
  }

  const decided = Number.parseInt(c.req.query('decided') ?? '', 10);

  return c.html(
    <ReportList
      locale={locale}
      timeZone={c.env.TIME_ZONE}
      reports={result.data}
      decidedId={Number.isSafeInteger(decided) ? decided : null}
    />
  );
});

app.get('/:lang/reports/:id{[0-9]+}', (c) =>
  renderReport(c, localeOf(c), c.req.param('id'))
);

app.post('/:lang/reports/:id{[0-9]+}/decision', async (c) => {
  const locale = localeOf(c);
  const reportId = c.req.param('id');
  const body = await c.req.parseBody();
  const decision = parseDecision(body.outcome, body.reason);
  const reason = typeof body.reason === 'string' ? body.reason : '';

  if (!decision) {
    return renderReport(
      c,
      locale,
      reportId,
      {
        outcome: null,
        reason,
        error: dictionaryFor(locale).invalidDecision
      },
      422
    );
  }

  const result = await decideReport(apiContext(c, locale), reportId, decision);

  if (!result.ok && result.status === 403) {
    return forbidden(c, locale);
  }

  if (!result.ok) {
    return renderReport(
      c,
      locale,
      reportId,
      {
        outcome: decision.outcome,
        reason,
        error: result.detail ?? dictionaryFor(locale).invalidDecision
      },
      422
    );
  }

  return c.redirect(`/${locale}/reports?decided=${reportId}`, 303);
});

app.notFound((c) => notFound(c, localeOf(c)));

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  if (error instanceof ApiUnavailableError) {
    console.error(error.message);
    const locale = localeOf(c);

    return c.html(
      <Message
        locale={locale}
        message={dictionaryFor(locale).apiUnavailable}
      />,
      502
    );
  }

  throw error;
});

export default app;
