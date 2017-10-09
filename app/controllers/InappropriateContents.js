import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class InappropriateContents extends Application {
  async create(ctx) {
    const client = new QoodishClient;
    await client.issueContent(ctx.request.headers.authorization, ctx.request.body);
    return;
  }
}

export default InappropriateContents;
