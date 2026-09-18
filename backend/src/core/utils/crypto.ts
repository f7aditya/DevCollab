import crypto from 'crypto';
import { AppError } from '../errors/AppError';

// Ensure the secret is 32 bytes for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; 
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    throw new AppError('Encryption failed', 500);
  }
};

export const decrypt = (text: string): string => {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    throw new AppError('Decryption failed', 500);
  }
};
