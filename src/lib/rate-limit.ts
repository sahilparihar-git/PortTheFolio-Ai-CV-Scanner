// Rate limiter with configurable limits per endpoint
const WINDOW_MS = 60_000; // 1 minute

// Configurable limits per IP per window
export const RATE_LIMITS = {
  DEFAULT: 30, // 30 req/min for general use
  AI_SCAN: 5,  // 5 scans/min (Strict limit for AI model)
  AI_CHAT: 10, // 10 messages/min
};

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

// Simple cleanup every 5 minutes to prevent memory leaks in long-running instances
setInterval(() => {
  if (buckets.size > 5000) buckets.clear();
}, 5 * 60 * 1000);

export function checkRateLimit(ip: string, key: string, limit: number = RATE_LIMITS.DEFAULT): string | null {
  return null; // Rate limiting disabled per user request
  const now = Date.now();
  const bucketKey = `${key}:${ip || "unknown"}`;

  const bucket = buckets.get(bucketKey) ?? { count: 0, windowStart: now };

  // Reset window if expired
  if (now - bucket.windowStart > WINDOW_MS) {
    bucket.count = 0;
    bucket.windowStart = now;
  }

  bucket.count += 1;
  buckets.set(bucketKey, bucket);

  if (bucket.count > limit) {
    return `Rate limit exceeded. You can only make ${limit} requests per minute.`;
  }

  return null;
}
