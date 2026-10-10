export const CF_ACCESS_TEAM_DOMAIN = 'yusuke-suzuki-0707.cloudflareaccess.com';

export type Environment = {
  appEnv: 'production' | 'development';
  databaseName: string;
  databaseId: string;
  webEndpoint: string;
  adminEndpoint: string;
  googleProjectId: string;
  accessAud: string;
};

export const PRODUCTION: Environment = {
  appEnv: 'production',
  databaseName: 'prod-qoodish-api',
  databaseId: '7d615fd7-7907-407b-b5fc-de93a6cb1d55',
  webEndpoint: 'https://qoodish.com',
  adminEndpoint: 'https://admin.qoodish.com',
  googleProjectId: 'qoodish',
  accessAud: '252ee6aa24f3b11f170ed50fd16a11d569890edc4f228ca76c36d46bd74c0f3b'
};

export const DEVELOPMENT: Environment = {
  appEnv: 'development',
  databaseName: 'dev-qoodish-api',
  databaseId: '80c87870-73f2-4f5e-b057-d9296600418a',
  webEndpoint: 'https://dev.qoodish.com',
  adminEndpoint: 'https://admin-dev.qoodish.com',
  googleProjectId: 'qoodish-dev',
  accessAud: '3ee39327262eb73242846c4cfc838367252dd82641f8370f089d6c6979147cb6'
};
