export class CircuitBreaker {
  constructor(threshold = 3, cooldownMs = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    this.state = 'CLOSED';
    this.nextAttempt = Date.now();
  }

  canAttempt() {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttempt) {
        // Cooldown over — probe in HALF_OPEN
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.cooldownMs;
    }
  }

  getState() {
    return this.state;
  }
} 
