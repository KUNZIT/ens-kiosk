// app/api/whitelist/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/app/redis'; // Import from your Redis client module

export async function POST(request: Request) {
  try {
    const redis = await getRedisClient(); // Get the Redis client

    const result = await redis.get('item');

    return NextResponse.json({ result }); // Use NextResponse.json()
  } catch (error) {
    console.error('Error fetching data from Redis:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// app/redis.ts (Example Redis client module)
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL; // Get Redis URL from environment variables

const client = createClient({
  url: redisUrl,
});

export async function getRedisClient() {
  try {
    if (!client.isOpen) {
      await client.connect(); // Connect only if not already connected
    }
    return client;
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}