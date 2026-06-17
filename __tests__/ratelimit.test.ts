import { RateLimiterMemory } from "rate-limiter-flexible";

describe("Rate Limiting", () => {
  it("should allow requests within the limit", async () => {
    const limiter = new RateLimiterMemory({ points: 3, duration: 60 });
    
    // Should not throw for first 3 requests
    await expect(limiter.consume("test-key")).resolves.toBeDefined();
    await expect(limiter.consume("test-key")).resolves.toBeDefined();
    await expect(limiter.consume("test-key")).resolves.toBeDefined();
  });

  it("should block requests that exceed the limit", async () => {
    const limiter = new RateLimiterMemory({ points: 2, duration: 60 });

    await limiter.consume("test-key-2");
    await limiter.consume("test-key-2");

    // Third request should throw (rate limit exceeded)
    await expect(limiter.consume("test-key-2")).rejects.toBeDefined();
  });

  it("should track different keys independently", async () => {
    const limiter = new RateLimiterMemory({ points: 1, duration: 60 });

    await limiter.consume("user-A");
    // user-A is now blocked, but user-B should still work
    await expect(limiter.consume("user-B")).resolves.toBeDefined();
    await expect(limiter.consume("user-A")).rejects.toBeDefined();
  });
});