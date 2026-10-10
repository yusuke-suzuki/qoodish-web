import { bindings, defineConfig } from 'cf/config';
import {
  CF_ACCESS_TEAM_DOMAIN,
  DEVELOPMENT,
  type Environment,
  PRODUCTION
} from './environments.ts';

const ACCOUNT_ID = '9671c836ad132f87d892b12ccd1809e0';

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
