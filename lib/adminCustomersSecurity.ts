import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyTotp } from '@/lib/totp';

const COOKIE_NAME = 'admin_customers_gate';
const ADMIN_SESSION_COOKIE = 'admin_session';
const DEFAULT_TTL_SECONDS = 60 * 60 * 8;

type GateStatus = {
  ok: boolean;
  status: number;
  reason: string;
  ip: string;
  host: string;
  twoFactorOk: boolean;
};

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

const safeEqual = (a: Buffer, b: Buffer) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const parseList = (value?: string) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getRequestIp = (request: NextRequest) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    ''
  );
};

const getRequestHost = (request: NextRequest) =>
  request.headers.get('x-forwarded-host') ||
  request.headers.get('host') ||
  '';

const getGateSecret = () => {
  const secret = process.env.ADMIN_CUSTOMERS_SESSION_SECRET || '';
  if (!secret) {
    throw new Error('ADMIN_CUSTOMERS_SESSION_SECRET is required');
  }
  return secret;
};

const getPinSecret = () => ({
  pin: process.env.ADMIN_CUSTOMERS_PIN || '',
  pinHash: process.env.ADMIN_CUSTOMERS_PIN_HASH || ''
});

const getTotpSecret = () => process.env.ADMIN_CUSTOMERS_TOTP_SECRET || '';

const getGateTtlSeconds = () => {
  const raw = process.env.ADMIN_CUSTOMERS_2FA_TTL_SECONDS || '';
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_SECONDS;
};

const getAllowedHosts = () =>
  parseList(process.env.ADMIN_CUSTOMERS_ALLOWED_HOSTS);

const getAllowedIps = () =>
  parseList(process.env.ADMIN_CUSTOMERS_ALLOWED_IPS);

const isHostAllowed = (host: string) => {
  const allowed = getAllowedHosts();
  if (allowed.length === 0) return true;
  return allowed.includes(host);
};

const isIpAllowed = (ip: string) => {
  const allowed = getAllowedIps();
  if (allowed.length === 0) return true;
  return allowed.includes(ip);
};

const hasAdminSession = (request: NextRequest) => {
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || '';
  return cookie.startsWith('admin_');
};

const signPayload = (payload: string, secret: string) =>
  base64UrlEncode(crypto.createHmac('sha256', secret).update(payload).digest());

const buildGateValue = (ip: string) => {
  const ttlSeconds = getGateTtlSeconds();
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = base64UrlEncode(
    Buffer.from(JSON.stringify({ ip, exp: expiresAt }), 'utf8')
  );
  const signature = signPayload(payload, getGateSecret());
  return `${payload}.${signature}`;
};

const verifyGateValue = (value: string, ip: string) => {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return false;

  let secret = '';
  try {
    secret = getGateSecret();
  } catch {
    return false;
  }

  const expected = signPayload(payload, secret);
  if (!safeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  const decoded = base64UrlDecode(payload).toString('utf8');
  let parsed: { ip?: string; exp?: number } | null = null;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return false;
  }

  if (!parsed || typeof parsed.exp !== 'number') return false;
  if (parsed.exp < Math.floor(Date.now() / 1000)) return false;
  if (parsed.ip && parsed.ip !== ip) return false;

  return true;
};

export const getAdminCustomersGateStatus = (request: NextRequest): GateStatus => {
  const ip = getRequestIp(request);
  const host = getRequestHost(request);

  if (!isHostAllowed(host)) {
    return {
      ok: false,
      status: 403,
      reason: 'Host is not allowed for admin customers.',
      ip,
      host,
      twoFactorOk: false
    };
  }

  if (!isIpAllowed(ip)) {
    return {
      ok: false,
      status: 403,
      reason: 'IP is not allowed for admin customers.',
      ip,
      host,
      twoFactorOk: false
    };
  }

  if (!hasAdminSession(request)) {
    return {
      ok: false,
      status: 401,
      reason: 'Admin session is required.',
      ip,
      host,
      twoFactorOk: false
    };
  }

  const gateCookie = request.cookies.get(COOKIE_NAME)?.value || '';
  const twoFactorOk = gateCookie ? verifyGateValue(gateCookie, ip) : false;

  return {
    ok: true,
    status: 200,
    reason: 'OK',
    ip,
    host,
    twoFactorOk
  };
};

export const requireAdminCustomersAccess = (request: NextRequest) => {
  const status = getAdminCustomersGateStatus(request);
  if (!status.ok) {
    return NextResponse.json(
      { success: false, error: status.reason },
      { status: status.status }
    );
  }

  if (!status.twoFactorOk) {
    return NextResponse.json(
      { success: false, error: 'Two-factor required.' },
      { status: 401 }
    );
  }

  return null;
};

export const verifyAdminCustomersPin = (pinInput: string) => {
  const { pin, pinHash } = getPinSecret();
  if (!pin && !pinHash) return false;

  const trimmed = pinInput.trim();
  if (pinHash) {
    const inputHash = crypto.createHash('sha256').update(trimmed).digest('hex');
    return safeEqual(Buffer.from(inputHash), Buffer.from(pinHash));
  }

  return safeEqual(Buffer.from(trimmed), Buffer.from(pin));
};

export const verifyAdminCustomersTotp = (token: string) => {
  const secret = getTotpSecret();
  if (!secret) return false;
  return verifyTotp(token, secret, { window: 1, step: 30, digits: 6 });
};

export const attachAdminCustomersGateCookie = (
  response: NextResponse,
  ip: string
) => {
  const value = buildGateValue(ip);
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: getGateTtlSeconds(),
    path: '/'
  });
};
