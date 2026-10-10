import { bindings, defineConfig } from 'cf/config';

const ACCOUNT_ID = '9671c836ad132f87d892b12ccd1809e0';

const CF_ACCESS_TEAM_DOMAIN = 'yusuke-suzuki-0707.cloudflareaccess.com';

type Environment = {
  appEnv: 'production' | 'development';
  databaseName: string;
  databaseId: string;
  webEndpoint: string;
  adminEndpoint: string;
  googleProjectId: string;
  accessAud: string;
};

const PRODUCTION: Environment = {
  appEnv: 'production',
  databaseName: 'prod-qoodish-api',
  databaseId: '7d615fd7-7907-407b-b5fc-de93a6cb1d55',
  webEndpoint: 'https://qoodish.com',
  adminEndpoint: 'https://admin.qoodish.com',
  googleProjectId: 'qoodish',
  accessAud: '252ee6aa24f3b11f170ed50fd16a11d569890edc4f228ca76c36d46bd74c0f3b'
};

const DEVELOPMENT: Environment = {
  appEnv: 'development',
  databaseName: 'dev-qoodish-api',
  databaseId: '80c87870-73f2-4f5e-b057-d9296600418a',
  webEndpoint: 'https://dev.qoodish.com',
  adminEndpoint: 'https://admin-dev.qoodish.com',
  googleProjectId: 'qoodish-dev',
  accessAud: '3ee39327262eb73242846c4cfc838367252dd82641f8370f089d6c6979147cb6'
};

function defineApiWorker(name: string, environment: Environment) {
  return {
    name,
    entrypoint: 'src/index.ts',
    compatibilityDate: '2026-07-01',
    compatibilityFlags: ['nodejs_compat'],
    placement: { mode: 'smart' as const },
    observability: {
      enabled: true,
      traces: { enabled: true },
      logs: { enabled: true },
      issues: { enabled: true }
    },
    env: {
      APP_ENV: bindings.text(environment.appEnv),
      WEB_ENDPOINT: bindings.text(environment.webEndpoint),
      ADMIN_ENDPOINT: bindings.text(environment.adminEndpoint),
      GOOGLE_PROJECT_ID: bindings.text(environment.googleProjectId),
      CF_ACCESS_TEAM_DOMAIN: bindings.text(CF_ACCESS_TEAM_DOMAIN),
      CF_ACCESS_AUD: bindings.text(environment.accessAud),
      DB: bindings.d1({
        name: environment.databaseName,
        id: environment.databaseId
      })
    }
  };
}

function selectWorker(mode: string | undefined, isPreview: boolean) {
  if (isPreview) {
    return defineApiWorker('dev-qoodish-api', DEVELOPMENT);
  }

  if (mode === 'production') {
    return {
      ...defineApiWorker('prod-qoodish-api', PRODUCTION),
      workersDev: false,
      previewUrls: false,
      domains: ['api-next.qoodish.com']
    };
  }

  return {
    ...defineApiWorker('dev-qoodish-api', DEVELOPMENT),
    workersDev: false,
    previewUrls: true,
    domains: ['api-next-dev.qoodish.com']
  };
}

export default defineConfig(({ mode, isPreview }) => ({
  accountId: ACCOUNT_ID,
  worker: selectWorker(mode, isPreview)
}));
