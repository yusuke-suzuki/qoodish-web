import { decodeBase64, encodeBase64 } from 'hono/utils/encode';
import type { Env } from './env.ts';

const KEY_DERIVATION_ITERATIONS = 2 ** 16;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const COMPRESSION_THRESHOLD = 140;

export type EncryptionSecrets = {
  primaryKey: string;
  keyDerivationSalt: string;
};

type EncryptedMessage = {
  p: string;
  h: { iv: string; at: string; c?: boolean };
};

const derivedKeys = new Map<string, Promise<CryptoKey>>();

export function encryptionSecrets(env: Env): EncryptionSecrets {
  return {
    primaryKey: env.ENCRYPTION_PRIMARY_KEY,
    keyDerivationSalt: env.ENCRYPTION_KEY_DERIVATION_SALT
  };
}

async function deriveKey({
  primaryKey,
  keyDerivationSalt
}: EncryptionSecrets): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const password = await crypto.subtle.importKey(
    'raw',
    encoder.encode(primaryKey),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(keyDerivationSalt),
      iterations: KEY_DERIVATION_ITERATIONS
    },
    password,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function keyFor(secrets: EncryptionSecrets): Promise<CryptoKey> {
  const cacheKey = `${secrets.primaryKey}\u0000${secrets.keyDerivationSalt}`;
  let key = derivedKeys.get(cacheKey);

  if (!key) {
    key = deriveKey(secrets);
    key.catch(() => derivedKeys.delete(cacheKey));
    derivedKeys.set(cacheKey, key);
  }

  return key;
}

function transformed(
  data: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream
): Promise<ArrayBuffer> {
  return new Response(
    new Blob([data]).stream().pipeThrough(stream)
  ).arrayBuffer();
}

export async function encryptAttribute(
  plaintext: string,
  secrets: EncryptionSecrets
): Promise<string> {
  const encoded = new Uint8Array(new TextEncoder().encode(plaintext));
  const compressed = encoded.length > COMPRESSION_THRESHOLD;
  const data = compressed
    ? await transformed(encoded, new CompressionStream('deflate'))
    : encoded;
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const sealed = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await keyFor(secrets),
    data
  );
  const message: EncryptedMessage = {
    p: encodeBase64(sealed.slice(0, sealed.byteLength - AUTH_TAG_LENGTH)),
    h: {
      iv: encodeBase64(iv.buffer),
      at: encodeBase64(sealed.slice(sealed.byteLength - AUTH_TAG_LENGTH)),
      ...(compressed ? { c: true } : {})
    }
  };

  return JSON.stringify(message);
}

export async function decryptAttribute(
  ciphertext: string,
  secrets: EncryptionSecrets
): Promise<string> {
  const message = JSON.parse(ciphertext) as EncryptedMessage;
  const sealed = new Uint8Array(
    await new Blob([
      decodeBase64(message.p),
      decodeBase64(message.h.at)
    ]).arrayBuffer()
  );
  const opened = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodeBase64(message.h.iv) },
    await keyFor(secrets),
    sealed
  );
  const plaintext = message.h.c
    ? await transformed(
        new Uint8Array(opened),
        new DecompressionStream('deflate')
      )
    : opened;

  return new TextDecoder().decode(plaintext);
}
