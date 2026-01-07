import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const base32ToBuffer = (input: string) => {
  const normalized = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = '';

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      continue;
    }
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
};

const hotp = (secret: Buffer, counter: number, digits = 6) => {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac('sha1', secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 10 ** digits).toString().padStart(digits, '0');
};

export const verifyTotp = (
  token: string,
  secretBase32: string,
  options?: { window?: number; step?: number; digits?: number }
) => {
  if (!token || !secretBase32) return false;

  const cleanToken = token.replace(/\s+/g, '');
  if (!/^\d+$/.test(cleanToken)) return false;

  const digits = options?.digits ?? 6;
  const step = options?.step ?? 30;
  const window = options?.window ?? 1;
  const secret = base32ToBuffer(secretBase32);

  if (!secret.length) return false;

  const counter = Math.floor(Date.now() / 1000 / step);
  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = hotp(secret, counter + offset, digits);
    if (candidate === cleanToken) {
      return true;
    }
  }

  return false;
};
