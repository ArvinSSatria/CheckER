/**
 * Simple in-memory rate limiter.
 * Limits requests per IP to prevent spam and reduce IP-blocking risk.
 */

interface RateLimitEntry {
  lastRequest: number;
}

const WINDOW_MS = 10 * 1000; // 10 seconds between requests

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;

  constructor(windowMs: number = WINDOW_MS) {
    this.windowMs = windowMs;
  }

  /**
   * Check if a request from the given IP is allowed.
   * Returns { allowed: true } or { allowed: false, retryAfter: seconds }.
   */
  check(ip: string): { allowed: true } | { allowed: false; retryAfter: number } {
    const now = Date.now();
    const entry = this.store.get(ip);

    if (entry) {
      const elapsed = now - entry.lastRequest;
      if (elapsed < this.windowMs) {
        const retryAfter = Math.ceil((this.windowMs - elapsed) / 1000);
        return { allowed: false, retryAfter };
      }
    }

    // Allow the request and record the timestamp
    this.store.set(ip, { lastRequest: now });
    return { allowed: true };
  }

  /**
   * Purge stale entries older than the window.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.store) {
      if (now - entry.lastRequest > this.windowMs) {
        this.store.delete(ip);
      }
    }
  }
}

// Single shared rate limiter across all API routes
export const rateLimiter = new RateLimiter();
