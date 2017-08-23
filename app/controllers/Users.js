import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Users extends Application {
  async delete(token, userId) {
    const client = new QoodishClient;
    await client.deleteAccount(token, userId);
    return;
  }
}

export default Users;
