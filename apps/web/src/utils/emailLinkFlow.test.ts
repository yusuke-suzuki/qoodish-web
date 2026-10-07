import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { memoryStorage } from '../test/localStorage.ts';
import { emailLinkFlow } from './emailLinkFlow.ts';

function storageWith(entries: Record<string, string>) {
  const storage = memoryStorage();

  for (const [key, value] of Object.entries(entries)) {
    storage.setItem(key, value);
  }

  return storage;
}

describe('emailLinkFlow', () => {
  it('completes a sign-in when no other flow is pending', () => {
    assert.equal(emailLinkFlow(storageWith({}), false), 'signIn');
    assert.equal(emailLinkFlow(storageWith({}), true), 'signIn');
  });

  it('changes the email of a signed-in user awaiting reauthentication', () => {
    const storage = storageWith({ reauthForEmailChange: 'true' });

    assert.equal(emailLinkFlow(storage, true), 'changeEmail');
  });

  it('waits for the user before changing the email', () => {
    const storage = storageWith({ reauthForEmailChange: 'true' });

    assert.equal(emailLinkFlow(storage, false), null);
  });

  it('links the email provider to a signed-in user', () => {
    const storage = storageWith({ linkProvider: 'true' });

    assert.equal(emailLinkFlow(storage, true), 'linkProvider');
  });

  it('waits for the user before linking the provider', () => {
    const storage = storageWith({ linkProvider: 'true' });

    assert.equal(emailLinkFlow(storage, false), null);
  });

  it('gives an email change priority over provider linking', () => {
    const storage = storageWith({
      reauthForEmailChange: 'true',
      linkProvider: 'true'
    });

    assert.equal(emailLinkFlow(storage, true), 'changeEmail');
  });

  it('ignores flags that are not exactly "true"', () => {
    const storage = storageWith({
      reauthForEmailChange: 'false',
      linkProvider: '1'
    });

    assert.equal(emailLinkFlow(storage, true), 'signIn');
  });
});
