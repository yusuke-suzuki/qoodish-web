import { bindings, defineConfig } from 'cf/config';

const ACCOUNT_ID = '9671c836ad132f87d892b12ccd1809e0';

type Environment = {
  apiEndpoint: string;
  webEndpoint: string;
  accessAud: string;
};

const PRODUCTION: Environment = {
  apiEndpoint: 'https://api.qoodish.com',
  webEndpoint: 'https://qoodish.com',
  accessAud: '252ee6aa24f3b11f170ed50fd16a11d569890edc4f228ca76c36d46bd74c0f3b'
};

const DEVELOPMENT: Environment = {
  apiEndpoint: 'https://api-dev.qoodish.com',
  webEndpoint: 'https://dev.qoodish.com',
  accessAud: '3ee39327262eb73242846c4cfc838367252dd82641f8370f089d6c6979147cb6'
};

function defineAdminWorker(name: string, environment: Environment) {
  return {
    name,
    entrypoint: 'src/index.tsx',
    compatibilityDate: '2026-07-01',
    observability: {
      enabled: true,
      traces: { enabled: true, destinations: ['grafana-traces'] },
      logs: { enabled: true, destinations: ['grafana-logs'] },
      issues: { enabled: true }
    },
    env: {
      API_ENDPOINT: bindings.text(environment.apiEndpoint),
      WEB_ENDPOINT: bindings.text(environment.webEndpoint),
      TIME_ZONE: bindings.text('Asia/Tokyo'),
      CF_ACCESS_TEAM_DOMAIN: bindings.text(
        'yusuke-suzuki-0707.cloudflareaccess.com'
      ),
      CF_ACCESS_AUD: bindings.text(environment.accessAud),
      BROWSER: bindings.browser({ dev: { remote: true } })
    }
  };
}

function selectWorker(mode: string | undefined, isPreview: boolean) {
  if (isPreview) {
    return defineAdminWorker('dev-qoodish-admin', DEVELOPMENT);
  }

  if (mode === 'production') {
    return {
      ...defineAdminWorker('prod-qoodish-admin', PRODUCTION),
      workersDev: false,
      previewUrls: false,
      domains: ['admin.qoodish.com']
    };
  }

  return {
    ...defineAdminWorker('dev-qoodish-admin', DEVELOPMENT),
    workersDev: false,
    previewUrls: true,
    domains: ['admin-dev.qoodish.com']
  };
}

export default defineConfig(({ mode, isPreview }) => ({
  accountId: ACCOUNT_ID,
  worker: selectWorker(mode, isPreview)
}));
