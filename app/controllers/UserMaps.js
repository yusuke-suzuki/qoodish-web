import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class UserMaps extends Application {
  async index(token, userId) {
    const client = new QoodishClient;
    let maps = await client.listMyMaps(token, userId);
    return maps;
  }
}

export default UserMaps;
