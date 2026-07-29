import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import withSerwistInit from '@serwist/next';

initOpenNextCloudflareForDev();

const withSerwist = withSerwistInit({
  swSrc: 'src/worker/index.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development'
});

/**
 * @type {import('next').NextConfig}
 */
export default withSerwist({
  experimental: {
    globalNotFound: true
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source'
    });

    return config;
  }
});
