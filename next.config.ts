import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

initOpenNextCloudflareForDev();

const withSerwist = withSerwistInit({
  swSrc: 'src/worker/index.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  // _headers configures the Cloudflare asset host and is not served as an
  // asset, so precaching it leaves the install waiting on a redirect that
  // never resolves into a response the worker can store.
  globPublicPatterns: ['**/!(_headers)']
});

const nextConfig: NextConfig = {
  // Workers Builds exposes the commit only while building, so the health
  // endpoint has to capture it here or the deployed worker cannot say which
  // commit it is running.
  env: {
    DEPLOYED_COMMIT_SHA:
      process.env.WORKERS_CI_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'unknown'
  },
  reactCompiler: true,
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
};

export default withSerwist(nextConfig);
