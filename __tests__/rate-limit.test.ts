// __tests__/rate-limit.test.ts

interface RateLimitEntry {
  timestamps: number[];
}

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

function createLimiter() {
  const store = new Map<string, RateLimitEntry>();
  return {
    check(identifier: string, now: number = Date.now()): { allowed: boolean; retryAfterMs: number } {
      const entry = store.get(identifier) ?? { timestamps: [] };
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
    },
    clear() {
      store.clear();
    },
  };
}

function sanitizeInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 1000);
}

describe('checkRateLimit()', () => {
  it('allows requests under the limit', () => {
    const limiter = createLimiter();
    for (let i = 0; i < 10; i++) {
      const result = limiter.check('user1');
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks the 11th request within the window', () => {
    const limiter = createLimiter();
    for (let i = 0; i < 10; i++) limiter.check('user2');
    const result = limiter.check('user2');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks different users independently', () => {
    const limiter = createLimiter();
    for (let i = 0; i < 10; i++) limiter.check('userA');
    const blockedA = limiter.check('userA');
    const allowedB = limiter.check('userB');
    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });

  it('allows requests again after window expires', () => {
    const limiter = createLimiter();
    const t0 = 1000000;
    for (let i = 0; i < 10; i++) limiter.check('user3', t0);
    const blocked = limiter.check('user3', t0 + 1000);
    expect(blocked.allowed).toBe(false);
    const allowedLater = limiter.check('user3', t0 + WINDOW_MS + 1);
    expect(allowedLater.allowed).toBe(true);
  });

  it('retryAfterMs decreases as window progresses', () => {
    const limiter = createLimiter();
    const t0 = 2000000;
    for (let i = 0; i < 10; i++) limiter.check('user4', t0);
    const blocked1 = limiter.check('user4', t0 + 1000);
    const blocked2 = limiter.check('user4', t0 + 30000);
    expect(blocked2.retryAfterMs).toBeLessThan(blocked1.retryAfterMs);
  });
});

describe('sanitizeInput()', () => {
  it('strips script tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>Hello');
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('strips all HTML tags', () => {
    const result = sanitizeInput('<b>bold</b> and <i>italic</i>');
    expect(result).not.toContain('<b>');
    expect(result).not.toContain('<i>');
    expect(result).toContain('bold');
    expect(result).toContain('italic');
  });

  it('removes javascript: protocol', () => {
    const result = sanitizeInput('javascript:alert(1)');
    expect(result.toLowerCase()).not.toContain('javascript:');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('   hello world   ')).toBe('hello world');
  });

  it('caps length at 1000 characters', () => {
    const longInput = 'a'.repeat(2000);
    const result = sanitizeInput(longInput);
    expect(result.length).toBe(1000);
  });

  it('preserves normal plain text unchanged', () => {
    const input = 'How can I reduce my carbon footprint?';
    expect(sanitizeInput(input)).toBe(input);
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('handles nested malicious tags', () => {
    const result = sanitizeInput('<img src=x onerror="alert(1)">test');
    expect(result).not.toContain('<img');
    expect(result).toContain('test');
  });
});
