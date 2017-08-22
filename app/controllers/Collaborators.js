import Application from './Application';
import QoodishClient from '../models/QoodishClient';

class Collaborators extends Application {
  async index(token, mapId) {
    const client = new QoodishClient;
    let collaborators = await client.fetchCollaborators(token, mapId);
    return collaborators;
  }
}

export default Collaborators;
