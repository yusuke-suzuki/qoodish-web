import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class InappropriateContents extends Application {
  async create(token, params) {
    const client = new QoodishClient;
    await client.issueContent(token, params);
    return;
  }
}

export default InappropriateContents;
