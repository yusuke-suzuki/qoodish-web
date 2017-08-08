import QoodishClient from '../models/QoodishClient';

class Auth {
  async create(params) {
    const client = new QoodishClient;
    const response = await client.signIn(params);
    console.log(response);
    return response;
  }
}

export default Auth;
