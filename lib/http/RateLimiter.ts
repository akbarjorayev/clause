// Fixed-window limit per key (client IP). In memory, so it resets when the server restarts;
// enough to stop casual abuse of the paid Muse API.
export class RateLimiter {
  private readonly windows = new Map<string, { startedAt: number; count: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  allow(key: string): boolean {
    const now = this.now();
    const window = this.windows.get(key);
    if (!window || now - window.startedAt > this.windowMs) {
      this.windows.set(key, { startedAt: now, count: 1 });
      return true;
    }
    if (window.count >= this.limit) return false;
    window.count++;
    return true;
  }
}
