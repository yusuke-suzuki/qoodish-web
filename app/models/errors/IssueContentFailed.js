import ApplicationError from './ApplicationError';

export default class IssueContentFailed extends ApplicationError {
  constructor(status = 500, detail = 'Failed to issue content.') {
    super(detail, status);
  }
}
