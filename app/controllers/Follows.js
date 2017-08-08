import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Follows extends Application {
  async create(token, mapId) {
    const client = new QoodishClient;
    let map = await client.joinMap(token, mapId);
    return map;
  }

  async destroy(token, mapId) {
    const client = new QoodishClient;
    let map = await client.leaveMap(token, mapId);
    return map;
  }
}

export default Follows;
