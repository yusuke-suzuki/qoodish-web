import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class UserMaps extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let maps = await client.listMyMaps(ctx.request.headers.authorization, ctx.params.userId);
    return maps;
  }
}

export default UserMaps;
