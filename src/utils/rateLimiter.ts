import { checkRateLimit } from '@/lib/redis';

export async function rateLimitMiddleware(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; headers: HeadersInit }> {
  const result = await checkRateLimit(identifier, limit, windowSeconds);
  
  const headersObj: Record<string, string | undefined> = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    ...(result.allowed ? {} : { 'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString() })
  };
  // Filter out undefined values for Record<string, string> compatibility
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(headersObj)) {
    if (typeof value === 'string') headers[key] = value;
  }
  
  return {
    allowed: result.allowed,
    headers,
  };
}

// Rate limiter for different user tiers
export async function getUserRateLimit(userId: string, tier: string) {
  const limits = {
    free: { requests: 10, window: 60 }, // 10 per minute
    pro: { requests: 100, window: 60 }, // 100 per minute  
    vip: { requests: 1000, window: 60 }, // 1000 per minute
  };
  
  const limit = limits[tier as keyof typeof limits] || limits.free;
  return rateLimitMiddleware(`user:${userId}`, limit.requests, limit.window);
}

// API-specific rate limiters
export async function mlbApiRateLimit(identifier: string) {
  // MLB API: 10 requests per second
  return rateLimitMiddleware(`mlb:${identifier}`, 10, 1);
}

export async function optimalBetRateLimit(identifier: string) {
  // OptimalBet API: 60 requests per minute
  return rateLimitMiddleware(`optimal:${identifier}`, 60, 60);
}
