/**
 * AES-256-GCM Encryption for Frontend
 * Uses Web Crypto API for encryption/decryption
 */

export class AESEncryption {
  private static ALGORITHM = 'AES-GCM';
  private static KEY_LENGTH = 256;
  private static IV_LENGTH = 12; // 96 bits for GCM

  /**
   * Generate a new AES-256 key
   */
  static async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export key to Base64 string for transmission
   */
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Import key from Base64 string
   */
  static async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = this.base64ToArrayBuffer(keyString);
    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt plaintext string
   * Returns Base64 encoded string containing IV + encrypted data
   */
  static async encrypt(plaintext: string, key: CryptoKey): Promise<string> {
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    // Convert plaintext to bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Encrypt
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    // Combine IV + ciphertext
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return Base64 encoded
    return this.arrayBufferToBase64(combined);
  }

  /**
   * Decrypt ciphertext
   * Input should be Base64 encoded string containing IV + encrypted data
   */
  static async decrypt(ciphertext: string, key: CryptoKey): Promise<string> {
    // Decode Base64
    const combined = this.base64ToArrayBuffer(ciphertext);

    // Extract IV and ciphertext
    const iv = combined.slice(0, this.IV_LENGTH);
    const data = combined.slice(this.IV_LENGTH);

    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Encrypt an object (converts to JSON first)
   */
  static async encryptObject(obj: any, key: CryptoKey): Promise<string> {
    const json = JSON.stringify(obj);
    return await this.encrypt(json, key);
  }

  /**
   * Decrypt to object (parses JSON)
   */
  static async decryptObject<T>(ciphertext: string, key: CryptoKey): Promise<T> {
    const json = await this.decrypt(ciphertext, key);
    return JSON.parse(json);
  }

  /**
   * Helper: ArrayBuffer to Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Helper: Base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
