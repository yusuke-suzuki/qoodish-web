import ApplicationError from './ApplicationError';

export default class AuthenticationFailed extends ApplicationError {
  constructor() {
    super('Authentication failed.', 401);
  }
}
