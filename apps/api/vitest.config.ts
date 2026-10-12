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
          queueProducers: { WEB_PUSH_QUEUE: DEVELOPMENT.webPushQueue },
          bindings: {
            APP_ENV: 'test',
            WEB_ENDPOINT: DEVELOPMENT.webEndpoint,
            ADMIN_ENDPOINT: DEVELOPMENT.adminEndpoint,
            GOOGLE_PROJECT_ID: DEVELOPMENT.googleProjectId,
            GOOGLE_CLIENT_EMAIL: DEVELOPMENT.googleClientEmail,
            CF_ACCESS_TEAM_DOMAIN,
            CF_ACCESS_AUD: DEVELOPMENT.accessAud,
            ENCRYPTION_PRIMARY_KEY: 'test_ar_encryption_primary_key_0',
            ENCRYPTION_KEY_DERIVATION_SALT:
              'test_ar_encryption_key_derive_salt',
            CLOUDFLARE_ACCOUNT_ID: 'test-account',
            CLOUDFLARE_IMAGES_ACCOUNT_HASH: 'mockhash',
            CLOUDFLARE_IMAGES_API_TOKEN: 'test-token',
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
