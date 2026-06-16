/**
 * Simple in-memory rate limiter using a sliding window algorithm.
 * Limits requests per user to prevent abuse of AI/chatbot endpoints.
 *
 * Note: For multi-instance serverless deployments, this resets per
 * cold start. For production-grade distributed rate limiting at scale,
 * an external store (e.g. Redis) would be used instead.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // 10 requests per minute per user

/**
 * Checks whether a given identifier (e.g. userId) has exceeded
 * the allowed request rate within the sliding window.
 *
 * @param identifier - Unique key to rate-limit on (typically userId)
 * @returns object with `allowed` boolean and `retryAfterMs` if blocked
 */
export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(identifier) ?? { timestamps: [] };

  // Drop timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldestInWindow);
    store.set(identifier, entry);
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(identifier, entry);
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Clears all rate limit state. Used for testing purposes only.
 */
export function clearRateLimitStore(): void {
  store.clear();
}
