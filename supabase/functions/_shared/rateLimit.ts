// Simple in-memory rate limiter for edge functions
// Limits requests per user/IP within a sliding window

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
const cleanup = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
};

setInterval(cleanup, 60_000);

export interface RateLimitConfig {
  maxRequests: number;    // max requests allowed
  windowMs: number;       // time window in milliseconds
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60_000, // 30 requests per minute
};

export const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000, // 10 requests per minute (for AI endpoints)
};

/**
 * Check if a request should be rate limited.
 * Returns null if allowed, or a Response if rate limited.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
  corsHeaders: Record<string, string> = {}
): Response | null {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  return null;
}

/**
 * Extract a rate limit identifier from the request.
 * Uses auth user ID if available, falls back to IP.
 */
export function getRateLimitKey(req: Request, prefix: string): string {
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Use a hash of the auth token as identifier
    const token = authHeader.replace('Bearer ', '').slice(-16);
    return `${prefix}:auth:${token}`;
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${prefix}:ip:${ip}`;
}
