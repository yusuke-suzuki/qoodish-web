const KEY_DERIVATION_ITERATIONS = 2 ** 16;

export type EncryptionSecrets = {
  primaryKey: string;
  keyDerivationSalt: string;
};

type EncryptedMessage = {
  p: string;
  h: { iv: string; at: string; c?: boolean };
};

const derivedKeys = new Map<string, Promise<CryptoKey>>();

function bytes(base64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
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
    ['decrypt']
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

async function inflate(data: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> {
  const stream = new Blob([data])
    .stream()
    .pipeThrough(new DecompressionStream('deflate'));

  return new Response(stream).arrayBuffer();
}

export async function decryptAttribute(
  ciphertext: string,
  secrets: EncryptionSecrets
): Promise<string> {
  const message = JSON.parse(ciphertext) as EncryptedMessage;
  const payload = bytes(message.p);
  const authTag = bytes(message.h.at);
  const sealed = new Uint8Array(payload.length + authTag.length);

  sealed.set(payload);
  sealed.set(authTag, payload.length);

  const opened = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytes(message.h.iv) },
    await keyFor(secrets),
    sealed
  );
  const plaintext = message.h.c
    ? await inflate(new Uint8Array(opened))
    : opened;

  return new TextDecoder().decode(plaintext);
}
