import crypto from 'crypto';

const base64UrlEncode = (input: Buffer) =>
  input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const base64UrlDecode = (input: string) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64');
};

const getKey = (value: string, label: string) => {
  if (!value) {
    throw new Error(`${label} is required`);
  }

  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    key = Buffer.from(value, 'hex');
  } else {
    key = Buffer.from(value, 'base64');
  }

  if (key.length !== 32) {
    throw new Error(`${label} must be 32 bytes (hex or base64)`);
  }

  return key;
};

export const normalizePhone = (input: string) =>
  input.replace(/\D/g, '');

export const hashPhone = (input: string) => {
  const key = getKey(process.env.ADMIN_CUSTOMERS_PHONE_HMAC_KEY || '', 'ADMIN_CUSTOMERS_PHONE_HMAC_KEY');
  const normalized = normalizePhone(input);
  const digest = crypto.createHmac('sha256', key).update(normalized).digest();
  return base64UrlEncode(digest);
};

export const encryptPhone = (input: string) => {
  const key = getKey(process.env.ADMIN_CUSTOMERS_PHONE_KEY || '', 'ADMIN_CUSTOMERS_PHONE_KEY');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(input, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    base64UrlEncode(iv),
    base64UrlEncode(tag),
    base64UrlEncode(encrypted)
  ].join('.');
};

export const decryptPhone = (payload: string) => {
  const key = getKey(process.env.ADMIN_CUSTOMERS_PHONE_KEY || '', 'ADMIN_CUSTOMERS_PHONE_KEY');
  const parts = payload.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted phone payload');
  }

  const iv = base64UrlDecode(parts[0]);
  const tag = base64UrlDecode(parts[1]);
  const encrypted = base64UrlDecode(parts[2]);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

export const getPhoneLast4 = (input: string) => {
  const normalized = normalizePhone(input);
  return normalized.slice(-4);
};

export const buildPhoneRecord = (input: string) => {
  const normalized = normalizePhone(input);
  return {
    phoneEncrypted: encryptPhone(normalized),
    phoneHash: hashPhone(normalized),
    phoneLast4: getPhoneLast4(normalized)
  };
};
