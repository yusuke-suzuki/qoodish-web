import Router from 'koa-router';
import render from 'koa-ejs';
import path from 'path';
import { generateMetadata } from './app/models/Utils';

const routes = (app) => {
  const router = new Router();

  render(app, {
    root: path.join(__dirname, './app/views'),
    layout: false
  });

  const ignoredPaths = [
    '/favicon.ico',
    '/robots.txt',
    '/apple-touch-icon-152x152-precomposed.png'
  ];

  router.get(ignoredPaths, async (ctx, next) => {
    ctx.status = 204;
  });

  const pageRoutes = [
    '/',
    '/timeline',
    '/discover',
    '/login',
    '/maps',
    '/maps/:mapId',
    '/maps/:mapId/reports/:reviewId',
    '/spots/:placeId',
    '/settings',
    '/terms',
    '/privacy'
  ];

  router.get(pageRoutes, async (ctx, next) => {
    let metadata = await generateMetadata(ctx);
    let assetPath;
    if (process.env.NODE_ENV === 'production') {
      assetPath = process.env.ASSET_PATH;
    } else {
      let manifestPath = './webpack-assets.json';
      delete require.cache[require.resolve(manifestPath)];
      let manifest = require(manifestPath);
      assetPath = manifest.main.js;
    }
    let params = {
      bundle: assetPath,
      googleMapUrl: `https://maps.google.com/maps/api/js?libraries=places&v=3&key=${process.env.GOOGLE_API_KEY_CLIENT}`,
      currentLocale: ctx.currentLocale,
      metadata: metadata
    };
    await ctx.render('index', params);
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

export default routes;
