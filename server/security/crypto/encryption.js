/**
 * Pentagon-Grade Cryptographic Layer
 * Triple Encryption: AES-256 + RSA-4096 + ChaCha20
 * Military-grade data protection with multiple cipher layers
 */

const crypto = require('crypto');
const forge = require('node-forge');

class CryptoLayer {
  constructor() {
    // Encryption algorithms configuration
    this.AES_ALGORITHM = 'aes-256-gcm';
    this.RSA_KEY_SIZE = 4096;
    this.CHACHA20_ALGORITHM = 'chacha20-poly1305';
    
    // Key derivation
    this.PBKDF2_ITERATIONS = 100000;
    this.SALT_LENGTH = 32;
    this.IV_LENGTH = 16;
    this.TAG_LENGTH = 16;
    
    // Initialize key pairs
    this.rsaKeyPair = null;
    this.initializeKeys();
  }

  /**
   * Initialize RSA key pairs for asymmetric encryption
   */
  async initializeKeys() {
    try {
      // Generate RSA-4096 key pair
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: this.RSA_KEY_SIZE,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: process.env.RSA_PASSPHRASE || 'pentagon-secure-key'
        }
      });

      this.rsaKeyPair = { publicKey, privateKey };
      console.log('RSA-4096 key pair generated successfully');
      
    } catch (error) {
      console.error('Failed to initialize cryptographic keys:', error);
      throw error;
    }
  }

  /**
   * Triple Encryption: AES-256 + RSA-4096 + ChaCha20
   * Layer 1: AES-256-GCM for fast symmetric encryption
   * Layer 2: RSA-4096 for key exchange and additional security
   * Layer 3: ChaCha20-Poly1305 for final encryption layer
   */
  async tripleEncrypt(data, password = null) {
    try {
      const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Layer 1: AES-256-GCM Encryption
      const aesResult = await this.aesEncrypt(plaintext, password);
      console.log('Layer 1 (AES-256): Complete');
      
      // Layer 2: RSA-4096 Encryption (encrypt the AES key and IV)
      const rsaResult = await this.rsaEncrypt(aesResult);
      console.log('Layer 2 (RSA-4096): Complete');
      
      // Layer 3: ChaCha20-Poly1305 Encryption
      const chachaResult = await this.chachaEncrypt(rsaResult);
      console.log('Layer 3 (ChaCha20): Complete');
      
      return {
        encrypted: chachaResult.encrypted,
        metadata: {
          layers: ['AES-256-GCM', 'RSA-4096', 'ChaCha20-Poly1305'],
          timestamp: Date.now(),
          keyDerivation: 'PBKDF2',
          ...chachaResult.metadata
        }
      };
      
    } catch (error) {
      console.error('Triple encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Triple Decryption: Reverse of triple encryption
   */
  async tripleDecrypt(encryptedData, password = null) {
    try {
      // Layer 3: ChaCha20 Decryption
      const chachaDecrypted = await this.chachaDecrypt(encryptedData);
      console.log('Layer 3 (ChaCha20) decryption: Complete');
      
      // Layer 2: RSA Decryption
      const rsaDecrypted = await this.rsaDecrypt(chachaDecrypted);
      console.log('Layer 2 (RSA-4096) decryption: Complete');
      
      // Layer 1: AES Decryption
      const aesDecrypted = await this.aesDecrypt(rsaDecrypted, password);
      console.log('Layer 1 (AES-256) decryption: Complete');
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(aesDecrypted);
      } catch {
        return aesDecrypted;
      }
      
    } catch (error) {
      console.error('Triple decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Layer 1: AES-256-GCM Encryption
   */
  async aesEncrypt(data, password = null) {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    // Derive key from password or generate random key
    let key;
    if (password) {
      key = crypto.pbkdf2Sync(password, salt, this.PBKDF2_ITERATIONS, 32, 'sha512');
    } else {
      key = crypto.randomBytes(32);
    }
    
    const cipher = crypto.createCipherGCM(this.AES_ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('pentagon-gateway', 'utf8'));
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      key: key.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      algorithm: this.AES_ALGORITHM
    };
  }

  /**
   * Layer 1: AES-256-GCM Decryption
   */
  async aesDecrypt(encryptedData, password = null) {
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    
    // Derive key from password or use provided key
    let key;
    if (password) {
      key = crypto.pbkdf2Sync(password, salt, this.PBKDF2_ITERATIONS, 32, 'sha512');
    } else {
      key = Buffer.from(encryptedData.key, 'base64');
    }
    
    const decipher = crypto.createDecipherGCM(encryptedData.algorithm, key, iv);
    decipher.setAAD(Buffer.from('pentagon-gateway', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Layer 2: RSA-4096 Encryption
   */
  async rsaEncrypt(aesData) {
    if (!this.rsaKeyPair) {
      throw new Error('RSA key pair not initialized');
    }
    
    // RSA can only encrypt data smaller than the key size
    // So we encrypt the AES key, IV, and metadata, not the actual data
    const sensitiveData = {
      key: aesData.key,
      salt: aesData.salt,
      iv: aesData.iv,
      tag: aesData.tag,
      algorithm: aesData.algorithm
    };
    
    const dataToEncrypt = JSON.stringify(sensitiveData);
    
    // Split data into chunks if needed (RSA-4096 can handle ~512 bytes)
    const maxChunkSize = (this.RSA_KEY_SIZE / 8) - 42; // OAEP padding overhead
    const chunks = [];
    
    for (let i = 0; i < dataToEncrypt.length; i += maxChunkSize) {
      const chunk = dataToEncrypt.slice(i, i + maxChunkSize);
      const encryptedChunk = crypto.publicEncrypt(
        {
          key: this.rsaKeyPair.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(chunk, 'utf8')
      );
      chunks.push(encryptedChunk.toString('base64'));
    }
    
    return {
      encrypted: aesData.encrypted, // Original AES encrypted data
      rsaEncryptedKeys: chunks,
      algorithm: 'RSA-4096-OAEP'
    };
  }

  /**
   * Layer 2: RSA-4096 Decryption
   */
  async rsaDecrypt(rsaData) {
    if (!this.rsaKeyPair) {
      throw new Error('RSA key pair not initialized');
    }
    
    // Decrypt each chunk
    let decryptedData = '';
    
    for (const chunk of rsaData.rsaEncryptedKeys) {
      const decryptedChunk = crypto.privateDecrypt(
        {
          key: this.rsaKeyPair.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
          passphrase: process.env.RSA_PASSPHRASE || 'pentagon-secure-key'
        },
        Buffer.from(chunk, 'base64')
      );
      decryptedData += decryptedChunk.toString('utf8');
    }
    
    const sensitiveData = JSON.parse(decryptedData);
    
    return {
      encrypted: rsaData.encrypted,
      ...sensitiveData
    };
  }

  /**
   * Layer 3: ChaCha20-Poly1305 Encryption
   */
  async chachaEncrypt(rsaData) {
    const key = crypto.randomBytes(32); // ChaCha20 key
    const nonce = crypto.randomBytes(12); // ChaCha20 nonce (96 bits)
    
    const cipher = crypto.createCipher(this.CHACHA20_ALGORITHM, key, nonce);
    cipher.setAAD(Buffer.from('pentagon-gateway-chacha', 'utf8'));
    
    const dataToEncrypt = JSON.stringify(rsaData);
    
    let encrypted = cipher.update(dataToEncrypt, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      metadata: {
        chachaKey: key.toString('base64'),
        chachaNonce: nonce.toString('base64'),
        chachaTag: tag.toString('base64'),
        algorithm: this.CHACHA20_ALGORITHM
      }
    };
  }

  /**
   * Layer 3: ChaCha20-Poly1305 Decryption
   */
  async chachaDecrypt(encryptedData) {
    const key = Buffer.from(encryptedData.metadata.chachaKey, 'base64');
    const nonce = Buffer.from(encryptedData.metadata.chachaNonce, 'base64');
    const tag = Buffer.from(encryptedData.metadata.chachaTag, 'base64');
    
    const decipher = crypto.createDecipher(encryptedData.metadata.algorithm, key, nonce);
    decipher.setAAD(Buffer.from('pentagon-gateway-chacha', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  /**
   * Hash password with salt (for user authentication)
   */
  async hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, this.PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
    
    return {
      hash: `${salt}:${hash}`,
      algorithm: 'PBKDF2-SHA512',
      iterations: this.PBKDF2_ITERATIONS
    };
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const passwordHash = crypto.pbkdf2Sync(password, salt, this.PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
    
    return hash === passwordHash;
  }

  /**
   * Generate cryptographically secure token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create digital signature for data integrity
   */
  async signData(data) {
    if (!this.rsaKeyPair) {
      throw new Error('RSA key pair not initialized');
    }
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const signature = crypto.sign('sha256', Buffer.from(dataString, 'utf8'), {
      key: this.rsaKeyPair.privateKey,
      passphrase: process.env.RSA_PASSPHRASE || 'pentagon-secure-key'
    });
    
    return {
      data: dataString,
      signature: signature.toString('base64'),
      algorithm: 'RSA-SHA256',
      timestamp: Date.now()
    };
  }

  /**
   * Verify digital signature
   */
  async verifySignature(signedData) {
    if (!this.rsaKeyPair) {
      throw new Error('RSA key pair not initialized');
    }
    
    const isValid = crypto.verify(
      'sha256',
      Buffer.from(signedData.data, 'utf8'),
      this.rsaKeyPair.publicKey,
      Buffer.from(signedData.signature, 'base64')
    );
    
    return isValid;
  }

  /**
   * Secure key derivation function
   */
  deriveKey(password, salt, keyLength = 32) {
    return crypto.pbkdf2Sync(password, salt, this.PBKDF2_ITERATIONS, keyLength, 'sha512');
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}

export default CryptoLayer;