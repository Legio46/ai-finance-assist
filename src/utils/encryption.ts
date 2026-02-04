/**
 * Bank-Level AES-256-GCM Encryption Utilities
 * 
 * This module provides client-side encryption for sensitive financial data
 * using the Web Crypto API with AES-256-GCM (Galois/Counter Mode).
 * 
 * Security Features:
 * - AES-256-GCM encryption (bank-grade)
 * - Unique IV (Initialization Vector) for each encryption
 * - Authenticated encryption (integrity verification)
 * - Secure key derivation from user password using PBKDF2
 */

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256, // 256-bit key for bank-level security
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

// Derive encryption key from password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-256-GCM key using PBKDF2
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate a random salt for key derivation
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Generate a random IV (Initialization Vector)
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
}

// Encrypt data using AES-256-GCM
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const iv = generateIV();

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    dataBuffer
  );

  // Convert to base64 for storage
  const ciphertext = arrayBufferToBase64(encryptedBuffer);
  const ivBase64 = arrayBufferToBase64(iv);

  return { ciphertext, iv: ivBase64 };
}

// Decrypt data using AES-256-GCM
export async function decryptData(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(ciphertext);
  const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv));

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer as BufferSource,
    },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Export key to base64 for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import key from base64
export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyBase64);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Helper: Convert ArrayBuffer or Uint8Array to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Mask sensitive data for display (e.g., credit card numbers)
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return data;
  const masked = '•'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}

// Validate encryption is available in the browser
export function isEncryptionSupported(): boolean {
  return !!(window.crypto && window.crypto.subtle);
}

// Security info for displaying to users
export const SECURITY_INFO = {
  encryptionType: 'AES-256-GCM',
  keyDerivation: 'PBKDF2-SHA256',
  iterations: 100000,
  standard: 'NIST-approved',
  certification: 'Bank-Grade Security',
  features: [
    'AES-256-GCM encryption (military-grade)',
    'Unique initialization vector per encryption',
    'Authenticated encryption with integrity verification',
    'PBKDF2 key derivation with 100,000 iterations',
    'TLS 1.3 encryption in transit',
    'Data encrypted at rest in database',
  ],
};
