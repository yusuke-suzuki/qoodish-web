import { ApiClient } from 'qoodish_api';
import getCurrentUser from './getCurrentUser';

const initializeApiClient = async () => {
  const defaultClient = ApiClient.instance;
  defaultClient.basePath = process.env.API_ENDPOINT;

  const currentUser = await getCurrentUser();
  const token = await currentUser.getIdToken();

  const firebaseAuth = defaultClient.authentications['firebaseAuth'];
  firebaseAuth.apiKey = token;
  firebaseAuth.apiKeyPrefix = 'Bearer';
};

export default initializeApiClient;
