import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';
import { CF_ACCESS_TEAM_DOMAIN, DEVELOPMENT } from './environments.ts';

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
          d1Databases: { DB: DEVELOPMENT.databaseName },
          bindings: {
            APP_ENV: 'test',
            WEB_ENDPOINT: DEVELOPMENT.webEndpoint,
            ADMIN_ENDPOINT: DEVELOPMENT.adminEndpoint,
            GOOGLE_PROJECT_ID: DEVELOPMENT.googleProjectId,
            CF_ACCESS_TEAM_DOMAIN,
            CF_ACCESS_AUD: DEVELOPMENT.accessAud,
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
