const { InjectManifest } = require('workbox-webpack-plugin');
const path = require('path');

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  output: 'standalone',
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en'
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new InjectManifest({
          swSrc: './src/worker/index.ts',
          swDest: path.join(__dirname, 'public', 'sw.js'),
          include: [/\.next\/static\/chunks\/.+\.js$/]
        })
      );
    }

    return config;
  }
};
