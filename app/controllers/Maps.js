import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Maps extends Application {
  async index(token, params) {
    const client = new QoodishClient;
    let maps;
    if (params.popular) {
      maps = await client.listPopularMaps(token);
    } else {
      maps = await client.listCurrentMaps(token);
    }
    return maps;
  }

  async show(token, mapId) {
    const client = new QoodishClient;
    let map = await client.fetchMap(token, mapId);
    return map;
  }

  async create(token, params) {
    const client = new QoodishClient;
    let map = await client.createMap(token, params);
    return map;
  }

  async update(token, params, mapId) {
    const client = new QoodishClient;
    let map = await client.updateMap(token, params, mapId);
    return map;
  }

  async delete(token, mapId) {
    const client = new QoodishClient;
    await client.deleteMap(token, mapId);
  }
}

export default Maps;
