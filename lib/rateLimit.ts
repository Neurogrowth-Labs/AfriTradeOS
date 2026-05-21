/**
 * Best-effort in-memory rate limiter for Vercel Edge / Serverless.
 * For production at scale, prefer Upstash Redis or Supabase Auth dashboard limits.
 */

type Bucket = { count: number; windowStart: number };

const globalStore = globalThis as typeof globalThis & {
  __afritradeRateLimits?: Map<string, Bucket>;
};

function getStore(): Map<string, Bucket> {
  if (!globalStore.__afritradeRateLimits) {
    globalStore.__afritradeRateLimits = new Map();
  }
  return globalStore.__afritradeRateLimits;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

/**
 * Fixed-window counter per key (e.g. IP or email).
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const map = getStore();
  const existing = map.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    map.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  existing.count += 1;
  map.set(key, existing);

  if (existing.count > maxAttempts) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - existing.windowStart)) / 1000)
    );
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}
