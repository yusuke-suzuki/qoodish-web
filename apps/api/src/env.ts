export interface Env {
  APP_ENV: string;
  WEB_ENDPOINT: string;
  ADMIN_ENDPOINT: string;
  GOOGLE_PROJECT_ID: string;
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
  AR_ENCRYPTION_PRIMARY_KEY: string;
  AR_ENCRYPTION_KEY_DERIVATION_SALT: string;
  DB: D1Database;
}

declare global {
  namespace Cloudflare {
    interface Env extends ApiEnv {}
  }
}

type ApiEnv = Env;
