import Router from 'koa-router';
import render from 'koa-ejs';
import path from 'path';
import error from 'koa-json-error';
import ApplicationError from './app/models/errors/ApplicationError';

import Auth from './app/controllers/Auth';
import Users from './app/controllers/Users';
import Devices from './app/controllers/Devices';
import Maps from './app/controllers/Maps';
import UserMaps from './app/controllers/UserMaps';
import Collaborators from './app/controllers/Collaborators';
import Spots from './app/controllers/Spots';
import Reviews from './app/controllers/Reviews';
import Likes from './app/controllers/Likes';
import Follows from './app/controllers/Follows';
import InappropriateContents from './app/controllers/InappropriateContents';
import Places from './app/controllers/Places';
import Notifications from './app/controllers/Notifications';

import { generateMetadata } from './app/models/Utils';

const formatError = (error) => {
  console.log(error);
  let json;
  if (error instanceof ApplicationError) {
    json = {
      status: error.status,
      title: error.name,
      detail: error.message
    };
  } else {
    json = {
      status: 500,
      title: 'Error',
      detail: 'The application has encountered an unknown error.'
    };
  }
  console.log(json);
  return json;
}

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

  router.post('/api/auth', error(formatError), async (ctx, next) => {
    const auth = new Auth;
    ctx.body = await auth.create(ctx);
  });

  router.post('/api/devices', error(formatError), async (ctx, next) => {
    const devices = new Devices;
    ctx.body = await devices.create(ctx);
    ctx.status = 204;
  });

  router.del('/api/devices/:registrationToken', error(formatError), async (ctx, next) => {
    const devices = new Devices;
    ctx.body = await devices.destroy(ctx);
    ctx.status = 204;
  });

  router.get('/api/users/:userId', error(formatError), async (ctx, next) => {
    const users = new Users;
    ctx.body = await users.show(ctx);
  });

  router.del('/api/users/:userId', error(formatError), async (ctx, next) => {
    const users = new Users;
    await users.delete(ctx);
    ctx.status = 204;
  });

  router.get('/api/users/:userId/maps', error(formatError), async (ctx, next) => {
    const userMaps = new UserMaps;
    ctx.body = await userMaps.index(ctx);
  });

  router.get('/api/maps', error(formatError), async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.index(ctx);
  });

  router.get('/api/maps/:mapId', error(formatError), async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.show(ctx);
  });

  router.post('/api/maps', error(formatError), async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.create(ctx);
  });

  router.put('/api/maps/:mapId', error(formatError), async (ctx, next) => {
    const maps = new Maps;
    ctx.body = await maps.update(ctx);
  });

  router.del('/api/maps/:mapId', error(formatError), async (ctx, next) => {
    const maps = new Maps;
    await maps.delete(ctx);
    ctx.status = 204;
  });

  router.get('/api/maps/:mapId/collaborators', error(formatError), async (ctx, next) => {
    const collaborators = new Collaborators;
    ctx.body = await collaborators.index(ctx);
  });

  router.get('/api/maps/:mapId/spots', error(formatError), async (ctx, next) => {
    const spots = new Spots;
    ctx.body = await spots.index(ctx);
  });

  router.get('/api/maps/:mapId/spots/:spotId', error(formatError), async (ctx, next) => {
    const spots = new Spots;
    ctx.body = await spots.show(ctx);
  });

  router.post('/api/maps/:mapId/reviews', error(formatError), async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.create(ctx);
  });

  router.get('/api/reviews', error(formatError), async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.index(ctx);
  });

  router.put('/api/reviews/:reviewId', error(formatError), async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.update(ctx);
  });

  router.del('/api/reviews/:reviewId', error(formatError), async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.delete(ctx);
  });

  router.get('/api/maps/:mapId/reviews', error(formatError), async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.index(ctx);
  });

  router.get('/api/maps/:mapId/reviews/:reviewId', error(formatError), async (ctx, next) => {
    const reviews = new Reviews;
    ctx.body = await reviews.show(ctx);
  });

  router.post('/api/maps/:mapId/follow', error(formatError), async (ctx, next) => {
    const follows = new Follows;
    ctx.body = await follows.create(ctx);
  });

  router.del('/api/maps/:mapId/follow', error(formatError), async (ctx, next) => {
    const follows = new Follows;
    ctx.body = await follows.destroy(ctx);
  });

  router.post('/api/inappropriate_contents', error(formatError), async (ctx, next) => {
    const inappropriateContents = new InappropriateContents;
    await inappropriateContents.create(ctx);
    ctx.status = 204;
  });

  router.get('/api/places', error(formatError), async (ctx, next) => {
    const places = new Places;
    ctx.body = await places.index(ctx);
  });

  router.get('/api/reviews/:reviewId/likes', error(formatError), async (ctx, next) => {
    const likes = new Likes;
    ctx.body = await likes.index(ctx);
  });

  router.post('/api/reviews/:reviewId/like', error(formatError), async (ctx, next) => {
    const likes = new Likes;
    ctx.body = await likes.create(ctx);
  });

  router.del('/api/reviews/:reviewId/like', error(formatError), async (ctx, next) => {
    const likes = new Likes;
    ctx.body = await likes.destroy(ctx);
  });

  router.get('/api/notifications', error(formatError), async (ctx, next) => {
    const notifications = new Notifications;
    ctx.body = await notifications.index(ctx);
  });

  router.put('/api/notifications/:notificationId', error(formatError), async (ctx, next) => {
    const notifications = new Notifications;
    ctx.body = await notifications.update(ctx);
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

export default routes;
