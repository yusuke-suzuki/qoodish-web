import { cloudflare } from '@cloudflare/vite-plugin';
import { responseStoreAdapter } from '@vinext/cloudflare/cache/response-store-adapter';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import serviceWorker from './vite/serviceWorker.ts';

export default defineConfig({
  plugins: [
    serviceWorker(),
    vinext({
      cache: responseStoreAdapter({ mode: 'self-contained' }),
      react: { compiler: true }
    }),
    cloudflare({
      viteEnvironment: {
        name: 'rsc',
        childEnvironments: ['ssr']
      }
    })
  ]
});
