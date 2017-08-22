import ApplicationError from './ApplicationError';

export default class FetchCollaboratorsFailed extends ApplicationError {
  constructor() {
    super('Failed to fetch collaborators.', 500);
  }
}
