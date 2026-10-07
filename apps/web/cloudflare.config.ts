import { createWorkersResponseStoreSelfContainedConfig } from '@vinext/cloudflare/cache/config';
import { bindings, defineConfig, exports } from 'cf/config';

const ACCOUNT_ID = '9671c836ad132f87d892b12ccd1809e0';

const OPENNEXT_DURABLE_OBJECTS = {
  DOQueueHandler: exports.durableObject({ state: 'deleted' }),
  DOShardedTagCache: exports.durableObject({ state: 'deleted' })
};

type Environment = {
  prefix: 'prod' | 'dev';
  appEnv: string;
  apiEndpoint: string;
  rateLimitNamespacePrefix: string;
};

const PRODUCTION: Environment = {
  prefix: 'prod',
  appEnv: 'production',
  apiEndpoint: 'https://api.qoodish.com',
  rateLimitNamespacePrefix: '1'
};

const DEVELOPMENT: Environment = {
  prefix: 'dev',
  appEnv: 'development',
  apiEndpoint: 'https://api-dev.qoodish.com',
  rateLimitNamespacePrefix: '2'
};

async function defineWebWorker(environment: Environment, isPreview: boolean) {
  const name = `${environment.prefix}-qoodish-web`;
  const cache = await createWorkersResponseStoreSelfContainedConfig({
    worker: name,
    bucket: `${name}-response-store`
  });

  return {
    ...cache,
    name,
    entrypoint: 'vinext/server/fetch-handler',
    assets: { notFoundHandling: 'none' as const },
    compatibilityDate: '2026-07-01',
    compatibilityFlags: ['nodejs_compat', 'global_fetch_strictly_public'],
    observability: {
      enabled: true,
      traces: { enabled: true, destinations: ['grafana-traces'] },
      logs: { enabled: true, destinations: ['grafana-logs'] },
      issues: { enabled: true }
    },
    env: {
      ...cache.env,
      ASSETS: bindings.assets(),
      APP_ENV: bindings.text(environment.appEnv),
      API_ENDPOINT: bindings.text(environment.apiEndpoint),
      ANALYTICS_EVENTS: bindings.analyticsEngineDataset({
        name: `${environment.prefix}_qoodish_web_events`
      }),
      IMAGE_UPLOAD_BURST_LIMIT: bindings.rateLimit({
        namespace: `${environment.rateLimitNamespacePrefix}001`,
        simple: { limit: 10, period: 10 }
      }),
      IMAGE_UPLOAD_LIMIT: bindings.rateLimit({
        namespace: `${environment.rateLimitNamespacePrefix}002`,
        simple: { limit: 30, period: 60 }
      })
    },
    exports: isPreview
      ? cache.exports
      : { ...OPENNEXT_DURABLE_OBJECTS, ...cache.exports }
  };
}

export default defineConfig(async ({ mode, isPreview }) => {
  if (isPreview) {
    return {
      accountId: ACCOUNT_ID,
      worker: await defineWebWorker(DEVELOPMENT, true)
    };
  }

  if (mode === 'production') {
    return {
      accountId: ACCOUNT_ID,
      worker: {
        ...(await defineWebWorker(PRODUCTION, false)),
        workersDev: false,
        previewUrls: false,
        domains: ['qoodish.com']
      }
    };
  }

  return {
    accountId: ACCOUNT_ID,
    worker: {
      ...(await defineWebWorker(DEVELOPMENT, false)),
      workersDev: true,
      previewUrls: true
    }
  };
});
