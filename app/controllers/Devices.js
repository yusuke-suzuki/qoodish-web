import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Devices extends Application {
  async create(token, params) {
    const client = new QoodishClient;
    await client.createDevice(token, params);
    return;
  }
}

export default Devices;
