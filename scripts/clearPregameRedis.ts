// scripts/clearPregameRedis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function clearPregameKeys() {
  let cursor = 0;
  let totalDeleted = 0;
  do {
    const scanResult = await redis.scan(cursor, {
      match: 'pregame:*',
      count: 100,
    });
    cursor = scanResult[0];
    const keys = scanResult[1] ?? [];
    if (keys.length > 0) {
      await redis.del(...keys);
      totalDeleted += keys.length;
      console.log(`Deleted ${keys.length} keys:`, keys);
    }
  } while (cursor !== 0);
  console.log(`Total pregame:* keys deleted: ${totalDeleted}`);
}

clearPregameKeys().catch(console.error);
