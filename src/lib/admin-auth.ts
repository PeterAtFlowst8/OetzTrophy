/**
 * Admin session auth for /admin (spec §5): HMAC-SHA256-signed expiry token in
 * an httpOnly cookie. Requires ADMIN_PASSWORD and ADMIN_SESSION_SECRET — no
 * fallback chain; missing secrets fail closed.
 * Tokens are stateless bearers: logout clears the cookie but cannot revoke an
 * already-issued token — rotate ADMIN_SESSION_SECRET to invalidate all sessions.
 */
import crypto from 'node:crypto';

export const ADMIN_COOKIE = '__Host-oetz_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

type Env = Record<string, string | undefined>;

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

export function verifyAdminPassword(candidate: string, env: Env = process.env): boolean {
  const expected = env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  return safeEqual(candidate, expected);
}

export function createAdminToken(env: Env = process.env, now: number = Date.now()): string {
  const secret = env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is required for admin sessions');
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000 }),
    'utf8',
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminToken(
  token: string | undefined,
  env: Env = process.env,
  now: number = Date.now(),
): boolean {
  const secret = env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  if (!safeEqual(sign(payload, secret), signature)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof session.expiresAt === 'number' && session.expiresAt > now;
  } catch {
    return false;
  }
}
