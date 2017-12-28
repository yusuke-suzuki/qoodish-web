import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Devices extends Application {
  async create(ctx) {
    const client = new QoodishClient;
    await client.createDevice(ctx.request.headers.authorization, ctx.request.body);
    return;
  }

  async destroy(ctx) {
    const client = new QoodishClient;
    await client.deleteDevice(ctx.request.headers.authorization, ctx.params.registrationToken);
    return;
  }
}

export default Devices;
