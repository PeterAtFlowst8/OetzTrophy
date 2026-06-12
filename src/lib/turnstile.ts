/**
 * Cloudflare Turnstile server-side verification (spec §4).
 * Config-symmetric: both keys present = enforced; both absent = disabled
 * (local dev); one present = misconfigured → callers must fail closed.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileConfig = 'enforced' | 'disabled' | 'misconfigured';

export function getTurnstileConfig(
  env: Record<string, string | undefined> = process.env,
): TurnstileConfig {
  const site = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = env.TURNSTILE_SECRET_KEY;
  if (site && secret) return 'enforced';
  if (!site && !secret) return 'disabled';
  return 'misconfigured';
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  try {
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const outcome = (await res.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false; // network failure → fail closed when enforced
  }
}
