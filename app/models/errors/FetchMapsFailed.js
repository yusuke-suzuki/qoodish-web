import ApplicationError from './ApplicationError';

export default class FetchMapsFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch maps.', 500);
  }
}
