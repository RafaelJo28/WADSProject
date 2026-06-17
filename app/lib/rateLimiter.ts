import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";


// login and register: 10 attempts per 15 minutes per IP
export const authLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 15, 
});

// AI question submission: 20 requests per hour per user
export const questionLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60 * 60,
});

// Follow-up questions: 30 requests per hour per user
export const followUpLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60 * 60,
});

// OCR uploads: 10 requests per hour per user
export const ocrLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 60,
});

export function getIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

export async function applyRateLimit(
  limiter: RateLimiterMemory,
  key: string,
  req: NextRequest
): Promise<Response | null> {
  try {
    await limiter.consume(key); 
    return null; 
  } catch {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait before trying again.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }
}