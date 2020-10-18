const withPWA = require('next-pwa');

module.exports = withPWA({
  pwa: {
    dest: 'public',
    buildExcludes: [/middleware-runtime\.js$/, /_middleware\.js$/]
  }
});
