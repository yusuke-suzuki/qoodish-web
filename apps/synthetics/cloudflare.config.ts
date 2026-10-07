import { bindings, defineConfig, triggers } from 'cf/config';

export default defineConfig({
  accountId: '9671c836ad132f87d892b12ccd1809e0',
  worker: {
    name: 'qoodish-web-synthetics',
    entrypoint: 'src/index.ts',
    compatibilityDate: '2026-07-01',
    compatibilityFlags: ['nodejs_compat'],
    workersDev: false,
    observability: {
      enabled: true,
      traces: { enabled: true, destinations: ['grafana-traces'] },
      logs: { enabled: true, destinations: ['grafana-logs'] },
      issues: { enabled: true }
    },
    triggers: [triggers.scheduled({ schedule: '*/30 * * * *' })],
    env: {
      TARGET_ORIGIN: bindings.text('https://qoodish.com'),
      BROWSER: bindings.browser()
    }
  }
});
