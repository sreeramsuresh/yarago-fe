/**
 * Encryption Manager
 * Orchestrates the complete encryption workflow:
 * 1. Fetch backend's RSA public key
 * 2. Generate AES session key
 * 3. Encrypt AES key with RSA and send to backend
 * 4. Use AES key for all subsequent data encryption
 */

import { AESEncryption } from './aesEncryption';
import { RSAEncryption } from './rsaEncryption';
import axios from 'axios';

export interface EncryptedPayload {
  encryptedData: string;
  keyId: string;
  timestamp?: number;
  signature?: string;
}

export interface SessionInfo {
  sessionId: string;
  aesKey: CryptoKey;
  established: Date;
}

class EncryptionManager {
  private sessionInfo: SessionInfo | null = null;
  private backendPublicKey: CryptoKey | null = null;
  private readonly API_BASE_URL = process.env.REACT_APP_API_URL;

  /**
   * Initialize encryption (call this on app startup)
   */
  async initialize(): Promise<void> {
    try {
      console.log('[EncryptionManager] Initializing secure communication...');

      // 1. Fetch backend's RSA public key
      const response = await axios.get(`${this.API_BASE_URL}/api/auth/public-key`);
      const publicKeyPem = response.data.data.publicKey;

      // 2. Import the public key
      this.backendPublicKey = await RSAEncryption.importPublicKey(publicKeyPem);

      // 3. Generate AES session key
      const aesKey = await AESEncryption.generateKey();

      // 4. Generate session ID
      const sessionId = this.generateSessionId();

      // 5. Export AES key and encrypt with RSA
      const aesKeyString = await AESEncryption.exportKey(aesKey);
      const encryptedAesKey = await RSAEncryption.encrypt(aesKeyString, this.backendPublicKey);

      // 6. Send encrypted AES key to backend for session establishment
      await axios.post(`${this.API_BASE_URL}/api/auth/establish-session`, {
        sessionId,
        encryptedSessionKey: encryptedAesKey,
      });

      // 7. Store session info in memory
      this.sessionInfo = {
        sessionId,
        aesKey,
        established: new Date(),
      };

      console.log('[EncryptionManager] Secure session established:', sessionId);
    } catch (error) {
      console.error('[EncryptionManager] Failed to initialize encryption:', error);
      throw new Error('Failed to establish secure communication');
    }
  }

  /**
   * Encrypt data before sending to backend
   */
  async encryptData(data: any): Promise<EncryptedPayload> {
    if (!this.sessionInfo) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }

    const encryptedData = await AESEncryption.encryptObject(data, this.sessionInfo.aesKey);

    return {
      encryptedData,
      keyId: this.sessionInfo.sessionId,
      timestamp: Date.now(),
    };
  }

  /**
   * Decrypt data received from backend
   */
  async decryptData<T>(payload: EncryptedPayload): Promise<T> {
    if (!this.sessionInfo) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }

    return await AESEncryption.decryptObject<T>(payload.encryptedData, this.sessionInfo.aesKey);
  }

  /**
   * Encrypt a single field
   */
  async encryptField(value: string): Promise<string> {
    if (!this.sessionInfo) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }

    return await AESEncryption.encrypt(value, this.sessionInfo.aesKey);
  }

  /**
   * Decrypt a single field
   */
  async decryptField(encryptedValue: string): Promise<string> {
    if (!this.sessionInfo) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }

    return await AESEncryption.decrypt(encryptedValue, this.sessionInfo.aesKey);
  }

  /**
   * Get session ID for requests
   */
  getSessionId(): string {
    if (!this.sessionInfo) {
      throw new Error('Encryption not initialized. Call initialize() first.');
    }
    return this.sessionInfo.sessionId;
  }

  /**
   * Check if encryption is initialized
   */
  isInitialized(): boolean {
    return this.sessionInfo !== null && this.backendPublicKey !== null;
  }

  /**
   * Clear session (call on logout)
   */
  clearSession(): void {
    this.sessionInfo = null;
    console.log('[EncryptionManager] Session cleared');
  }

  /**
   * Refresh session if expired
   */
  async refreshSession(): Promise<void> {
    this.clearSession();
    await this.initialize();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }
}

// Export singleton instance
export const encryptionManager = new EncryptionManager();

// Auto-initialize on import (optional - you can also call manually)
export const initializeEncryption = async () => {
  if (!encryptionManager.isInitialized()) {
    await encryptionManager.initialize();
  }
};
