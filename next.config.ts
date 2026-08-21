import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

initOpenNextCloudflareForDev();

const withSerwist = withSerwistInit({
  swSrc: 'src/worker/index.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    reactCompiler: true
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source'
    });

    return config;
  }
};

export default withSerwist(nextConfig);
