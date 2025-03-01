// app/redis.ts
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

const client = createClient({
  url: redisUrl,
});

export async function getRedisClient() {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    throw error;
  }
}