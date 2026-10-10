import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const migrations = await readD1Migrations(
    path.join(import.meta.dirname, 'migrations')
  );

  return {
    plugins: [
      cloudflareTest({
        main: './src/index.ts',
        miniflare: {
          compatibilityDate: '2026-07-01',
          compatibilityFlags: ['nodejs_compat'],
          d1Databases: { DB: 'test-qoodish-api' },
          bindings: {
            APP_ENV: 'test',
            WEB_ENDPOINT: 'https://qoodish.test',
            ADMIN_ENDPOINT: 'https://admin.qoodish.test',
            GOOGLE_PROJECT_ID: 'qoodish-test',
            CF_ACCESS_TEAM_DOMAIN: 'qoodish.cloudflareaccess.com',
            CF_ACCESS_AUD: 'admin-aud',
            TEST_MIGRATIONS: migrations
          }
        }
      })
    ],
    test: {
      setupFiles: ['./src/test/setup.ts']
    }
  };
});
