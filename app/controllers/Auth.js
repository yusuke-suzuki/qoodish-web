import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Auth extends Application {
  async create(params) {
    const client = new QoodishClient;
    const response = await client.signIn(params);
    return response;
  }
}

export default Auth;
