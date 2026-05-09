import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'oetz_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type AdminSession = {
  role: 'admin';
  expiresAt: number;
};

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

function getSigningSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || getAdminPassword();
}

function signPayload(payload: string) {
  const secret = getSigningSecret();
  if (!secret) return null;

  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function createToken(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  const signature = signPayload(payload);

  if (!signature) {
    throw new Error('ADMIN_PASSWORD or ADMIN_SESSION_SECRET is required for admin login');
  }

  return `${payload}.${signature}`;
}

function verifyToken(token: string | undefined) {
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = signPayload(payload);
  if (!expectedSignature || !safeEqual(signature, expectedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    return session.role === 'admin' && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function verifyAdminPassword(password: string) {
  const expectedPassword = getAdminPassword();
  if (!expectedPassword || !password) return false;

  return safeEqual(password, expectedPassword);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const token = createToken({ role: 'admin', expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
