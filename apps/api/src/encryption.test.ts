import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import {
  decryptAttribute,
  encryptAttribute,
  encryptionSecrets
} from './encryption.ts';

const secrets = encryptionSecrets(env);

const RAILS_SHORT =
  '{"p":"kAB2zxHkHX4rYQ==","h":{"iv":"2wBiU3O0tPXjfxft","at":"ipz2YrcxjHmajSKRGx0zYg=="}}';
const RAILS_COMPRESSED =
  '{"p":"hg1VsmB9mpBR1KEIcw==","h":{"iv":"l7Sb5Kexs1FOoyiH","at":"LuiPNR1NsSnsgM5abDvOYQ==","c":true}}';

function decodedLength(base64: string): number {
  return atob(base64).length;
}

function shape(ciphertext: string) {
  const message = JSON.parse(ciphertext);

  return {
    keys: Object.keys(message),
    headers: Object.keys(message.h),
    ivLength: decodedLength(message.h.iv),
    authTagLength: decodedLength(message.h.at)
  };
}

describe('decryptAttribute', () => {
  it('decrypts what Active Record Encryption wrote', async () => {
    expect(await decryptAttribute(RAILS_SHORT, secrets)).toBe('_p~iF~ps|U');
    expect(
      await decryptAttribute(
        '{"p":"E1ekLka8W1ML+JiSi8hBYuMwiQIAGvQJS+k4xwEKBQ==","h":{"iv":"zlzXrbi/3X4mpRz4","at":"vkBBWkfACGTzqQZyKy0IqQ=="}}',
        secrets
      )
    ).toBe('日本語の経路 encoded path');
  });

  it('inflates a compressed payload', async () => {
    expect(await decryptAttribute(RAILS_COMPRESSED, secrets)).toBe(
      'a'.repeat(300)
    );
  });

  it('rejects a payload sealed with another key', async () => {
    await expect(
      decryptAttribute(RAILS_SHORT, { ...secrets, primaryKey: 'another_key' })
    ).rejects.toThrow();
  });
});

describe('encryptAttribute', () => {
  it('writes the message Active Record Encryption writes', async () => {
    const ciphertext = await encryptAttribute('_p~iF~ps|U', secrets);

    expect(shape(ciphertext)).toEqual(shape(RAILS_SHORT));
    expect(decodedLength(JSON.parse(ciphertext).p)).toBe(
      decodedLength(JSON.parse(RAILS_SHORT).p)
    );
    expect(ciphertext).not.toBe(await encryptAttribute('_p~iF~ps|U', secrets));
  });

  it('compresses a payload over 140 bytes as Active Record Encryption does', async () => {
    const ciphertext = await encryptAttribute('a'.repeat(300), secrets);

    expect(shape(ciphertext)).toEqual(shape(RAILS_COMPRESSED));
    expect(JSON.parse(ciphertext).h.c).toBe(true);
    expect(
      shape(await encryptAttribute('a'.repeat(140), secrets)).headers
    ).toEqual(['iv', 'at']);
  });

  it('round-trips through decryptAttribute', async () => {
    for (const plaintext of [
      '_p~iF~ps|U',
      '日本語の経路 encoded path',
      'a'.repeat(300),
      'é'.repeat(71),
      '_p~iF~ps|U'.repeat(200)
    ]) {
      expect(
        await decryptAttribute(
          await encryptAttribute(plaintext, secrets),
          secrets
        )
      ).toBe(plaintext);
    }
  });

  it('round-trips what Active Record Encryption wrote', async () => {
    for (const ciphertext of [RAILS_SHORT, RAILS_COMPRESSED]) {
      const plaintext = await decryptAttribute(ciphertext, secrets);

      expect(
        await decryptAttribute(
          await encryptAttribute(plaintext, secrets),
          secrets
        )
      ).toBe(plaintext);
    }
  });
});
