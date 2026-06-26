/**
 * Signed, stateless tokens for the self-service links in the payment-reminder
 * email: "complete payment" (resume) and "deregister" (cancel). A token binds a
 * registration row id + email under an HMAC so the links can't be forged or
 * pointed at someone else's row. No DB column needed — verification recomputes
 * the HMAC.
 *
 * Token format: `base64url(payloadJson).base64url(hmacSha256(body))`.
 * Fails closed: no secret → sign throws, verify returns null.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export type ActionTokenPayload = { id: number; email: string };

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

export function signActionToken(
  id: number,
  email: string,
  secret: string | undefined = process.env.REGISTRATION_ACTION_SECRET,
): string {
  if (!secret) throw new Error('REGISTRATION_ACTION_SECRET is not set');
  const body = Buffer.from(JSON.stringify({ id, email }), 'utf8').toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

export function verifyActionToken(
  token: string,
  secret: string | undefined = process.env.REGISTRATION_ACTION_SECRET,
): ActionTokenPayload | null {
  if (!secret || typeof token !== 'string') return null;

  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(body, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof parsed?.id !== 'number' || typeof parsed?.email !== 'string') return null;
    return { id: parsed.id, email: parsed.email };
  } catch {
    return null;
  }
}
