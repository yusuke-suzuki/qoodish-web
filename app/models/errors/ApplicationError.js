import ExtendableError from 'es6-error';

export default class ApplicationError extends ExtendableError {
  constructor(detail = 'Unknown error', status = 500) {
    super(detail);
    this.status = status;
  }
}
