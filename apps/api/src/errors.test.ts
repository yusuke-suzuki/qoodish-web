import { describe, expect, it } from 'vitest';
import { ApiError } from './errors.ts';

describe('ApiError', () => {
  it('uses the default message of the status unless a detail is given', () => {
    expect(new ApiError('Conflict').body('en')).toEqual({
      title: 'Conflict',
      detail: 'A conflict has occurred for the requested resource.'
    });
    expect(
      new ApiError('UnprocessableContent', 'Map name is duplicated.').body('ja')
    ).toEqual({
      title: 'UnprocessableContent',
      detail: 'Map name is duplicated.'
    });
  });
});
