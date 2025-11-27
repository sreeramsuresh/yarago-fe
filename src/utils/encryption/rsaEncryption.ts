/**
 * RSA Encryption for Frontend
 * Used for secure key exchange with backend
 */

export class RSAEncryption {
  /**
   * Import RSA public key from Base64 PEM string
   */
  static async importPublicKey(pemString: string): Promise<CryptoKey> {
    // Remove PEM header/footer and decode Base64
    const pemContents = pemString
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '');

    const binaryDer = this.base64ToArrayBuffer(pemContents);

    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
  }

  /**
   * Encrypt data with RSA public key
   * Used to encrypt AES session key before sending to backend
   */
  static async encrypt(data: string, publicKey: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      dataBuffer
    );

    return this.arrayBufferToBase64(encrypted);
  }

  /**
   * Encrypt ArrayBuffer (e.g., exported AES key)
   */
  static async encryptBytes(data: ArrayBuffer, publicKey: CryptoKey): Promise<string> {
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      data
    );

    return this.arrayBufferToBase64(encrypted);
  }

  /**
   * Helper: ArrayBuffer to Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Helper: Base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
