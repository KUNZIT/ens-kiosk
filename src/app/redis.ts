// app/redis.ts
import Redis from 'ioredis';

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('Redis URL is not defined in .env.local');
  }

  redisClient = new Redis(redisUrl);

  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });

  return redisClient;
}