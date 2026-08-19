export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp in ms when window resets
  retryAfter: number; // seconds until retry allowed
}

interface RateLimitRecord {
  timestamps: number[];
}

/**
 * In-Memory Sliding-Window Rate Limiter
 * Tracks timestamp history per key (userId or IP address).
 */
class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically clean up stale entries every 5 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check and consume rate limit tokens
   * @param key Identifier (e.g. userId or client IP)
   * @param limit Max requests allowed in the window (default 30)
   * @param windowMs Time window in milliseconds (default 60,000ms = 1 minute)
   */
  public check(key: string, limit = 30, windowMs = 60000): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside the current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0] || windowStart;
      const resetTime = oldestInWindow + windowMs;
      const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000));

      return {
        success: false,
        limit,
        remaining: 0,
        reset: resetTime,
        retryAfter,
      };
    }

    // Record this request
    record.timestamps.push(now);
    const remaining = limit - record.timestamps.length;
    const resetTime = now + windowMs;

    return {
      success: true,
      limit,
      remaining,
      reset: resetTime,
      retryAfter: 0,
    };
  }

  /**
   * Cleanup stale records to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000;

    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < maxAge);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();
