import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Follows extends Application {
  async create(ctx) {
    const client = new QoodishClient;
    let map = await client.joinMap(ctx.request.headers.authorization, ctx.params.mapId);
    return map;
  }

  async destroy(ctx) {
    const client = new QoodishClient;
    let map = await client.leaveMap(ctx.request.headers.authorization, ctx.params.mapId);
    return map;
  }
}

export default Follows;
