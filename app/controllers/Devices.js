import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Devices extends Application {
  async create(ctx) {
    const client = new QoodishClient;
    await client.createDevice(ctx.request.headers.authorization, ctx.request.body);
    return;
  }
}

export default Devices;
