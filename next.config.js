const withSerwistInit = require('@serwist/next').default;

const withSerwist = withSerwistInit({
  swSrc: 'src/worker/index.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development'
});

/**
 * @type {import('next').NextConfig}
 */
module.exports = withSerwist({
  output: 'standalone',
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en'
  }
});
