import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Spots extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let spots = await client.fetchSpots(ctx.request.headers.authorization, ctx.params.mapId, ctx.currentLocale);
    return spots;
  }

  async show(ctx) {
    const client = new QoodishClient;
    let spot = await client.fetchSpot(ctx.request.headers.authorization, ctx.params.mapId, ctx.params.spotId, ctx.currentLocale);
    return spot;
  }
}

export default Spots;
