export class RateLimiter {
  constructor(limit, intervalMs) {
    this.limit = limit;
    this.intervalMs = intervalMs;
    this.tokens = limit;

    setInterval(() => {
      this.tokens = this.limit;
    }, intervalMs);
  }

  tryRemoveToken() {
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
}
export class RateLimitExceededError extends Error {
  constructor(message = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitExceededError";
  }
}