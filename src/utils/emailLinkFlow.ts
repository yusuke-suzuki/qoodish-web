export type EmailLinkFlow = 'changeEmail' | 'linkProvider' | 'signIn';

export function emailLinkFlow(
  storage: Pick<Storage, 'getItem'>,
  signedIn: boolean
): EmailLinkFlow | null {
  if (storage.getItem('reauthForEmailChange') === 'true') {
    return signedIn ? 'changeEmail' : null;
  }

  if (storage.getItem('linkProvider') === 'true') {
    return signedIn ? 'linkProvider' : null;
  }

  return 'signIn';
}
