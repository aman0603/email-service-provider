import { retryWithBackoff } from "./RetryHelper.js";
import { EmailLog } from "../models/EmailLog.js";
import { CircuitBreaker } from "./CircuitBreaker.js";

export class EmailService {
  constructor(providers, rateLimiter) {
    this.providers = providers;
    this.rateLimiter = rateLimiter;
    this.breaker = new Map();
    this.providers.forEach((provider) => {
      this.breaker.set(
        this.name,
        new CircuitBreaker(3, 60000) // 3 failures threshold, 60s cooldown
      );
    });
  }

  async _sendWithTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Provider timeout")), ms)
      ),
    ]);
  }

  async sendEmail({ id, to, subject, body }) {
    try {

      // Idempotency check
      let existing;
      try {
        existing = await EmailLog.findOne({ emailId: id });
      } catch (err) {
        console.error("DB error on idempotency check:", err.message);
        throw new Error("Database database error");
      } 
      if (existing) {
        console.log("✅ Email already sent or in progress:", id);
        return;
      }


      // Check rate limit
      if (!this.rateLimiter.tryRemoveToken()) {
        throw new Error("Rate limit exceeded");
      }

      // Create initial log
      try {await EmailLog.create({
        emailId: id,
        to,
        subject,
        body,
        status: "PENDING",
        retryCount: 0,
      });}catch (err) {
        if (err.code === 11000) {
          // Duplicate key error, log already exists
          console.log("Email log already exists, continuing:", id);
          return;
        }
        console.error("Failed to create initial EmailLog:", err.message);
        throw new Error("Database error creating log");
      }

      // Try each provider with circuit breaker
      for (let i = 0; i < this.providers.length; i++) {
        const provider = this.providers[i];
        const breaker = this.breaker.get(provider.name);

        if (!breaker.canAttempt()) {
          console.warn(`Provider ${provider.name} is in OPEN state, skipping`);
          continue;
        }
        console.log(`Trying provider ${provider.name} for email ${id}`);
        try {
          await retryWithBackoff(() => this._sendWithTimeout(provider.send({ to, subject, body }), 5000),3);


          //success 
          breaker.recordSuccess();
          await EmailLog.findOneAndUpdate(
            { emailId: id },
            {
              status: i === 0 ? "SENT" : "FALLBACK_USED",
              providerUsed: provider.name,
              retryCount: i,
            }
          );

          console.log(`Email sent using ${provider.name}`);
          return;
        } catch (err) {
          // Record failure
          breaker.recordFailure();
          console.error(`Provider ${provider.name} failed`, err.message);
          await EmailLog.findOneAndUpdate(
            {emailId:id},
            {
              $inc: { retryCount: 1 },
            }
          );
        }
      }

      // All providers failed
      await EmailLog.findOneAndUpdate(
        { emailId: id },
        {
          status: "FAILED",
          errorMessage: "All providers failed",
        }
      );
      throw new Error("All providers failed");
      
    } catch (error) {
      console.error("Unexpected error in sendEmail:", error.message);

      // Best effort log update
      try {
        await EmailLog.findOneAndUpdate(
          { emailId: id },
          {
            status: "FAILED",
            errorMessage: error.message,
          },
          { upsert: true } //ensure log is created if it doesn't exist  or Even if the initial .create() failed (e.g. Mongo offline)
        );
      } catch (logErr) {
        console.error("Failed to update EmailLog with error:", logErr.message);
      }

      throw error;
    }
  }

  async getStatus(emailId) {
    try {
      const log = await EmailLog.findOne({ emailId });
      return log ? log.status : "NOT_FOUND";
    } catch (error) {
      console.error("Error getting status:", error.message);
      throw new Error("Failed to get status");
    }
  }
}
