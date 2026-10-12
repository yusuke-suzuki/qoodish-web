import type { WebPushMessage } from './web-push.ts';

export interface Env {
  APP_ENV: string;
  WEB_ENDPOINT: string;
  ADMIN_ENDPOINT: string;
  GOOGLE_PROJECT_ID: string;
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
  ENCRYPTION_PRIMARY_KEY: string;
  ENCRYPTION_KEY_DERIVATION_SALT: string;
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_ACCOUNT_HASH: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  DB: D1Database;
  WEB_PUSH_QUEUE: Queue<WebPushMessage>;
}

declare global {
  namespace Cloudflare {
    interface Env extends ApiEnv {}
  }
}

type ApiEnv = Env;
