import type { D1Migration } from 'cloudflare:test';

export interface Env {
  APP_ENV: string;
  WEB_ENDPOINT: string;
  ADMIN_ENDPOINT: string;
  GOOGLE_PROJECT_ID: string;
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
  DB: D1Database;
  TEST_MIGRATIONS?: D1Migration[];
}

declare global {
  namespace Cloudflare {
    interface Env extends ApiEnv {}
  }
}

type ApiEnv = Env;
