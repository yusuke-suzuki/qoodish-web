import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { decryptAttribute } from './encryption.ts';

const secrets = {
  primaryKey: env.ENCRYPTION_PRIMARY_KEY,
  keyDerivationSalt: env.ENCRYPTION_KEY_DERIVATION_SALT
};

describe('decryptAttribute', () => {
  it('decrypts what Active Record Encryption wrote', async () => {
    expect(
      await decryptAttribute(
        '{"p":"kAB2zxHkHX4rYQ==","h":{"iv":"2wBiU3O0tPXjfxft","at":"ipz2YrcxjHmajSKRGx0zYg=="}}',
        secrets
      )
    ).toBe('_p~iF~ps|U');
    expect(
      await decryptAttribute(
        '{"p":"E1ekLka8W1ML+JiSi8hBYuMwiQIAGvQJS+k4xwEKBQ==","h":{"iv":"zlzXrbi/3X4mpRz4","at":"vkBBWkfACGTzqQZyKy0IqQ=="}}',
        secrets
      )
    ).toBe('日本語の経路 encoded path');
  });

  it('inflates a compressed payload', async () => {
    expect(
      await decryptAttribute(
        '{"p":"hg1VsmB9mpBR1KEIcw==","h":{"iv":"l7Sb5Kexs1FOoyiH","at":"LuiPNR1NsSnsgM5abDvOYQ==","c":true}}',
        secrets
      )
    ).toBe('a'.repeat(300));
  });

  it('rejects a payload sealed with another key', async () => {
    await expect(
      decryptAttribute(
        '{"p":"kAB2zxHkHX4rYQ==","h":{"iv":"2wBiU3O0tPXjfxft","at":"ipz2YrcxjHmajSKRGx0zYg=="}}',
        { ...secrets, primaryKey: 'another_key' }
      )
    ).rejects.toThrow();
  });
});
