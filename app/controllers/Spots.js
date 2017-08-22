import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Spots extends Application {
  async index(token, mapId, locale) {
    const client = new QoodishClient;
    let spots = await client.fetchSpots(token, mapId, locale);
    return spots;
  }

  async show(token, mapId, spotId, locale) {
    const client = new QoodishClient;
    let spot = await client.fetchSpot(token, mapId, spotId, locale);
    return spot;
  }
}

export default Spots;
