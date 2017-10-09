import Router from 'koa-router';
import render from 'koa-ejs';
import path from 'path';

import Auth from './app/controllers/Auth';
import Users from './app/controllers/Users';
import Devices from './app/controllers/Devices';
import Maps from './app/controllers/Maps';
import UserMaps from './app/controllers/UserMaps';
import Collaborators from './app/controllers/Collaborators';
import Spots from './app/controllers/Spots';
import Reviews from './app/controllers/Reviews';
import Follows from './app/controllers/Follows';
import InappropriateContents from './app/controllers/InappropriateContents';

import { detectLanguage, generateMetadata } from './app/models/Utils';

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
    '/settings'
  ];

  router.get(pageRoutes, async (ctx, next) => {
    let metadata = await generateMetadata(ctx.request, ctx.params, detectLanguage(ctx.request));
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
      currentLocale: detectLanguage(ctx.request),
      metadata: metadata
    };
    await ctx.render('index', params);
  });

  router.post('/api/auth', async (ctx, next) => {
    const auth = new Auth;
    ctx.body = await auth.create(ctx.request.body);
  });

  router.post('/api/devices', async (ctx, next) => {
    const devices = new Devices;
    ctx.body = await devices.create(ctx.request.headers.authorization, ctx.request.body);
    ctx.status = 204;
  });

  router.get('/api/users/:userId', async (ctx, next) => {
    const users = new Users;
    ctx.body = await users.show(ctx.request.headers.authorization, ctx.params.userId);
  });

  router.del('/api/users/:userId', async (ctx, next) => {
    const users = new Users;
    await users.delete(ctx.request.headers.authorization, ctx.params.userId);
    ctx.status = 204;
  });

  router.get('/api/users/:userId/maps', async (ctx, next) => {
    const userMaps = new UserMaps;
    ctx.body = await userMaps.index(ctx.request.headers.authorization, ctx.params.userId);
  });

  router.get('/api/maps', async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.index(ctx.request.headers.authorization, ctx.query);
  });

  router.get('/api/maps/:mapId', async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.show(ctx.request.headers.authorization, ctx.params.mapId);
  });

  router.post('/api/maps', async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.create(ctx.request.headers.authorization, ctx.request.body);
  });

  router.put('/api/maps/:mapId', async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.update(ctx.request.headers.authorization, ctx.request.body, ctx.params.mapId);
  });

  router.del('/api/maps/:mapId', async (ctx, next) => {
    const maps = new Maps;
    await maps.delete(ctx.request.headers.authorization, ctx.params.mapId);
    ctx.status = 204;
  });

  router.get('/api/maps/:mapId/collaborators', async (ctx, next) => {
    const collaborators = new Collaborators;
    ctx.body = await collaborators.index(ctx.request.headers.authorization, ctx.params.mapId);
  });

  router.get('/api/maps/:mapId/spots', async (ctx, next) => {
    const spots = new Spots;
    ctx.body = await spots.index(ctx.request.headers.authorization, ctx.params.mapId, detectLanguage(ctx.request));
  });

  router.get('/api/maps/:mapId/spots/:spotId', async (ctx, next) => {
    const spots = new Spots;
    ctx.body = await spots.show(ctx.request.headers.authorization, ctx.params.mapId, ctx.params.spotId, detectLanguage(ctx.request));
  });

  router.post('/api/maps/:mapId/reviews', async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.create(ctx.request.headers.authorization, ctx.params.mapId, ctx.request.body);
  });

  router.get('/api/reviews', async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.index(ctx.request.headers.authorization, detectLanguage(ctx.request), null, ctx.query);
  });

  router.put('/api/reviews/:reviewId', async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.update(ctx.request.headers.authorization, ctx.params.reviewId, ctx.request.body);
  });

  router.del('/api/reviews/:reviewId', async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.delete(ctx.request.headers.authorization, ctx.params.reviewId);
  });

  router.get('/api/maps/:mapId/reviews', async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.index(ctx.request.headers.authorization, detectLanguage(ctx.request), ctx.params.mapId, ctx.query);
  });

  router.get('/api/maps/:mapId/reviews/:reviewId', async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.show(ctx.request.headers.authorization, detectLanguage(ctx.request), ctx.params.mapId, ctx.params.reviewId);
  });

  router.post('/api/maps/:mapId/follow', async (ctx, next) => {
    const follows = new Follows;
    ctx.body = await follows.create(ctx.request.headers.authorization, ctx.params.mapId);
  });

  router.del('/api/maps/:mapId/follow', async (ctx, next) => {
    const follows = new Follows;
    ctx.body = await follows.destroy(ctx.request.headers.authorization, ctx.params.mapId);
  });

  router.post('/api/inappropriate_contents', async (ctx, next) => {
    const inappropriateContents = new InappropriateContents;
    await inappropriateContents.create(ctx.request.headers.authorization, ctx.request.body);
    ctx.status = 204;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

export default routes;
