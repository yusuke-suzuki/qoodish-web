import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { injectManifest } from '@serwist/build';
import { build, type Plugin } from 'vite';
import { LOCALES } from '../src/utils/locales.ts';
import { offlinePath } from '../src/utils/offline.ts';

const SOURCE = 'src/worker/index.ts';
const FILE_NAME = 'sw.js';

export default function serviceWorker(): Plugin {
  let root = '';
  let outDir = '';

  return {
    name: 'qoodish:service-worker',
    apply: 'build',
    applyToEnvironment: (environment) => environment.name === 'client',
    writeBundle() {
      root = this.environment.config.root;
      outDir = path.resolve(root, this.environment.config.build.outDir);
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      async handler() {
        const bundleDir = await mkdtemp(path.join(tmpdir(), 'qoodish-sw-'));

        try {
          await build({
            configFile: false,
            root,
            publicDir: false,
            logLevel: 'warn',
            build: {
              outDir: bundleDir,
              emptyOutDir: true,
              lib: {
                entry: path.resolve(root, SOURCE),
                formats: ['iife'],
                name: 'serviceWorker',
                fileName: () => FILE_NAME
              }
            }
          });

          const offlinePageRevision = randomUUID();
          const { warnings } = await injectManifest({
            swSrc: path.join(bundleDir, FILE_NAME),
            swDest: path.join(outDir, FILE_NAME),
            globDirectory: outDir,
            globPatterns: ['**/*'],
            // _headers configures the Cloudflare asset host and is not served
            // as an asset, so precaching it leaves the install waiting on a
            // redirect that never resolves into a response the worker can store.
            globIgnores: [
              '_headers',
              FILE_NAME,
              'vinext-client-entry-manifest.json'
            ],
            dontCacheBustURLsMatching: /^_next\/static\//,
            additionalPrecacheEntries: LOCALES.map((locale) => ({
              url: offlinePath(locale),
              revision: offlinePageRevision
            }))
          });

          for (const warning of warnings) {
            this.warn(warning);
          }
        } finally {
          await rm(bundleDir, { recursive: true, force: true });
        }
      }
    }
  };
}
