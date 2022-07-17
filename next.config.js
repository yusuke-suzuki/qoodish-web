const withPWA = require('next-pwa');

module.exports = withPWA({
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en'
  },
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
    buildExcludes: [/middleware-runtime\.js$/, /_middleware\.js$/]
  }
});
