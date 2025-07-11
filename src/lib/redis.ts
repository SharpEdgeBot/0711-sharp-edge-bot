import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Game context caching
export async function getCachedGameContext(gameId: string) {
  try {
    const cached = await redis.get(`game_context:${gameId}`);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCachedGameContext(gameId: string, context: any, ttlSeconds = 600) {
  try {
    await redis.setex(`game_context:${gameId}`, ttlSeconds, JSON.stringify(context));
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

// Rate limiting
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `rate_limit:${identifier}`;
  
  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    
    const ttl = await redis.ttl(key);
    const resetTime = Date.now() + (ttl * 1000);
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow the request
    return {
      allowed: true,
      remaining: limit,
      resetTime: Date.now() + (windowSeconds * 1000),
    };
  }
}

// Cache MLB schedule data
export async function getCachedSchedule(date: string) {
  try {
    const cached = await redis.get(`schedule:${date}`);
    return cached;
  } catch (error) {
    console.error('Redis get schedule error:', error);
    return null;
  }
}

export async function setCachedSchedule(date: string, schedule: any, ttlSeconds = 3600) {
  try {
    await redis.setex(`schedule:${date}`, ttlSeconds, JSON.stringify(schedule));
  } catch (error) {
    console.error('Redis set schedule error:', error);
  }
}

// Cache odds data (shorter TTL due to frequent changes)
export async function getCachedOdds(eventId: string, marketType: string) {
  try {
    const cached = await redis.get(`odds:${eventId}:${marketType}`);
    return cached;
  } catch (error) {
    console.error('Redis get odds error:', error);
    return null;
  }
}

export async function setCachedOdds(
  eventId: string, 
  marketType: string, 
  odds: any, 
  ttlSeconds = 300
) {
  try {
    await redis.setex(
      `odds:${eventId}:${marketType}`, 
      ttlSeconds, 
      JSON.stringify(odds)
    );
  } catch (error) {
    console.error('Redis set odds error:', error);
  }
}
