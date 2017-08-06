import Router from 'koa-router';
import render from 'koa-ejs';
import path from 'path';

const routes = (app) => {
  const router = new Router();

  render(app, {
    root: path.join(__dirname, './app/views'),
    layout: false
  });

  const pageRoutes = [
    '/'
  ];

  router.get(pageRoutes, async (ctx, next) => {
    let manifestPath = './webpack-assets.json';
    if (process.env.NODE_ENV != 'production') {
      delete require.cache[require.resolve(manifestPath)];
    }
    let manifest = require(manifestPath);
    await ctx.render('index', { bundle: manifest.main.js });
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
}

export default routes;
