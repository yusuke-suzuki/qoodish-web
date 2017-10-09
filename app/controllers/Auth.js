import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Auth extends Application {
  async create(ctx) {
    const client = new QoodishClient;
    const response = await client.signIn(ctx.request.body);
    return response;
  }
}

export default Auth;
