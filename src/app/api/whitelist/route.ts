// app/api/whitelist/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/app/redis'; // Import from your Redis client module

export async function POST(request: Request) {
  try {
    const redis = await getRedisClient(); // Get the Redis client
    const { ensName } = await request.json(); // Get ensName from the request body

    if (!ensName) {
      return NextResponse.json({ error: 'ENS name is required' }, { status: 400 });
    }

    const result = await redis.get(`whitelisted:${ensName}`); // Retrieve data based on ensName

    const isWhitelisted = result === 'true'; // Convert result to boolean

    return NextResponse.json({ isWhitelisted }); // Return isWhitelisted
  } catch (error) {
    console.error('Error fetching data from Redis:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}