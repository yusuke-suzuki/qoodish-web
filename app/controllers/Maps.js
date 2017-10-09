import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Maps extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let maps;
    if (ctx.query.popular) {
      maps = await client.listPopularMaps(ctx.request.headers.authorization);
    } else {
      maps = await client.listFollowingMaps(ctx.request.headers.authorization);
    }
    return maps;
  }

  async show(ctx) {
    const client = new QoodishClient;
    let map = await client.fetchMap(ctx.request.headers.authorization, ctx.params.mapId);
    return map;
  }

  async create(ctx) {
    const client = new QoodishClient;
    let map = await client.createMap(ctx.request.headers.authorization, ctx.request.body);
    return map;
  }

  async update(ctx) {
    const client = new QoodishClient;
    let map = await client.updateMap(ctx.request.headers.authorization, ctx.request.body, ctx.params.mapId);
    return map;
  }

  async delete(ctx) {
    const client = new QoodishClient;
    await client.deleteMap(ctx.request.headers.authorization, ctx.params.mapId);
  }
}

export default Maps;
