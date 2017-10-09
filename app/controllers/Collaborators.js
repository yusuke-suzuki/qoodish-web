import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Collaborators extends Application {
  async index(ctx) {
    const client = new QoodishClient;
    let collaborators = await client.fetchCollaborators(ctx.request.headers.authorization, ctx.params.mapId);
    return collaborators;
  }
}

export default Collaborators;
