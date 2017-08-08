import request from 'superagent';
import AuthenticationFailed from './errors/AuthenticationFailed';

class QoodishClient {
  async signIn(params) {
    try {
      let url = `${process.env.API_ENDPOINT}/api/users`;
      let headers = {
        'Content-Type': 'application/json'
      };
      const response = await request.post(url).send(params).set(headers);
      return response.body;
    } catch (e) {
      console.log(e);
      throw new AuthenticationFailed;
    }
  }
}

export default QoodishClient;
