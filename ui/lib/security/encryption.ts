/**
 * Encryption Utilities for Sensitive Data
 * Uses Web Crypto API for secure encryption
 */

/**
 * Generate encryption key from password
 */
export const deriveKey = async (
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt data using AES-GCM
 */
export const encrypt = async (
  data: string,
  key: CryptoKey
): Promise<{
  encrypted: string;
  iv: string;
}> => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(data)
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
};

/**
 * Decrypt data using AES-GCM
 */
export const decrypt = async (
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> => {
  const decoder = new TextDecoder();

  const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0)
  );
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );

  return decoder.decode(decryptedBuffer);
};

/**
 * Hash data using SHA-256
 */
export const hash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Secure random string generator
 */
export const generateSecureRandom = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
};

/**
 * Secure storage wrapper with encryption
 */
export class SecureStorage {
  private key: CryptoKey | null = null;

  async initialize(password: string): Promise<void> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    this.key = await deriveKey(password, salt);
    // Store salt in localStorage (not sensitive)
    localStorage.setItem('__salt', btoa(String.fromCharCode(...salt)));
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.key) {
      throw new Error('SecureStorage not initialized');
    }

    const { encrypted, iv } = await encrypt(value, this.key);
    localStorage.setItem(key, JSON.stringify({ encrypted, iv }));
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.key) {
      throw new Error('SecureStorage not initialized');
    }

    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    try {
      const { encrypted, iv } = JSON.parse(stored);
      return await decrypt(encrypted, iv, this.key);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

export const secureStorage = new SecureStorage();
