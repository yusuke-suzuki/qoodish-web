import ApplicationError from './ApplicationError';

export default class FetchSpotsFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch spots.', 500);
  }
}
