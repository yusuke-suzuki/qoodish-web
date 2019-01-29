module.exports = {
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  testEnvironment: './puppeteer_environment.js',
  setupFilesAfterEnv: ['expect-puppeteer'],
  testPathIgnorePatterns: []
};
