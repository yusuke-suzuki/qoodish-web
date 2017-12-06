import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Places extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let places;
    if (ctx.query.input) {
      places = await client.searchPlaces(ctx.request.headers.authorization, ctx.query.input, ctx.currentLocale);
    } else {
      places = await client.searchNearPlaces(ctx.request.headers.authorization, ctx.query.lat, ctx.query.lng, ctx.currentLocale);
    }
    return places;
  }
}

export default Places;
