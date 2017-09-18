import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Users extends Application {
  async show(token, userId) {
    const client = new QoodishClient;
    let user = await client.fetchUser(token, userId);
    return user;
  }

  async delete(token, userId) {
    const client = new QoodishClient;
    await client.deleteAccount(token, userId);
    return;
  }
}

export default Users;
