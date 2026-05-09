import crypto from 'node:crypto';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

const buckets = new Map<string, Bucket>();
let lastCleanupAt = 0;

function cleanup(now: number) {
  if (now - lastCleanupAt < 60_000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  lastCleanupAt = now;
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown';
}

export function hashRateLimitValue(value: string) {
  return crypto.createHash('sha256').update(value).digest('base64url');
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  cleanup(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: Math.max(limit - 1, 0), retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);

  return {
    limited: existing.count > limit,
    remaining: Math.max(limit - existing.count, 0),
    retryAfter,
  };
}

export function rateLimitHeaders(retryAfter: number) {
  return retryAfter > 0 ? { 'Retry-After': String(retryAfter) } : undefined;
}
