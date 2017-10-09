import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Users extends Application {
  async show(ctx) {
    const client = new QoodishClient;
    let user = await client.fetchUser(ctx.request.headers.authorization, ctx.params.userId);
    return user;
  }

  async delete(ctx) {
    const client = new QoodishClient;
    await client.deleteAccount(ctx.request.headers.authorization, ctx.params.userId);
    return;
  }
}

export default Users;
