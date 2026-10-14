import { bindings, defineConfig, exports, triggers } from 'cf/config';
import {
  CF_ACCESS_TEAM_DOMAIN,
  DEVELOPMENT,
  type Environment,
  MAIL_FROM,
  MAIL_REPLY_TO,
  PRODUCTION,
  REPORT_NOTIFICATION_EMAIL
} from './environments.ts';

const ACCOUNT_ID = '9671c836ad132f87d892b12ccd1809e0';
const IMAGES_ACCOUNT_HASH = 'ij3ygWRDWuATHKgheHKS5A';

function defineApiWorker(name: string, environment: Environment) {
  const accountDeletion = `${name}-account-deletion`;

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
      GOOGLE_CLIENT_EMAIL: bindings.text(environment.googleClientEmail),
      CF_ACCESS_TEAM_DOMAIN: bindings.text(CF_ACCESS_TEAM_DOMAIN),
      CF_ACCESS_AUD: bindings.text(environment.accessAud),
      MAIL_FROM: bindings.text(MAIL_FROM),
      MAIL_REPLY_TO: bindings.text(MAIL_REPLY_TO),
      REPORT_NOTIFICATION_EMAIL: bindings.text(REPORT_NOTIFICATION_EMAIL),
      ENCRYPTION_PRIMARY_KEY: bindings.secret(),
      ENCRYPTION_KEY_DERIVATION_SALT: bindings.secret(),
      GOOGLE_PRIVATE_KEY: bindings.secret(),
      CLOUDFLARE_ACCOUNT_ID: bindings.text(ACCOUNT_ID),
      CLOUDFLARE_IMAGES_ACCOUNT_HASH: bindings.text(IMAGES_ACCOUNT_HASH),
      CLOUDFLARE_IMAGES_API_TOKEN: bindings.secret(),
      DB: bindings.d1({
        name: environment.databaseName,
        id: environment.databaseId
      }),
      WEB_PUSH_QUEUE: bindings.queue({ name: environment.webPushQueue }),
      MAIL_QUEUE: bindings.queue({ name: environment.mailQueue }),
      EMAIL: bindings.sendEmail({ allowedSenderAddresses: [MAIL_FROM] }),
      ACCOUNT_DELETION: bindings.workflow({
        name: accountDeletion,
        worker: name,
        exportName: 'AccountDeletion'
      })
    },
    exports: {
      AccountDeletion: exports.workflow({ name: accountDeletion })
    }
  };
}

function queueConsumers(environment: Environment) {
  return [
    triggers.queue({ name: environment.webPushQueue }),
    triggers.queue({ name: environment.mailQueue })
  ];
}

function selectWorker(mode: string | undefined, isPreview: boolean) {
  if (isPreview) {
    return defineApiWorker('dev-qoodish-api', DEVELOPMENT);
  }

  if (mode === 'production') {
    return {
      ...defineApiWorker('prod-qoodish-api', PRODUCTION),
      triggers: queueConsumers(PRODUCTION),
      workersDev: false,
      previewUrls: false,
      domains: ['api-next.qoodish.com']
    };
  }

  return {
    ...defineApiWorker('dev-qoodish-api', DEVELOPMENT),
    triggers: queueConsumers(DEVELOPMENT),
    workersDev: false,
    previewUrls: true,
    domains: ['api-dev.qoodish.com']
  };
}

export default defineConfig(({ mode, isPreview }) => ({
  accountId: ACCOUNT_ID,
  worker: selectWorker(mode, isPreview)
}));
