// app/api/whitelist/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/app/redis'; // Adjust the import path

export async function POST(request: Request) {
  try {
    const { ensName } = await request.json();
    const redis = await getRedisClient();
    const isWhitelisted = await redis.get(`whitelist:${ensName.toLowerCase()}`);

    return NextResponse.json({ isWhitelisted: !!isWhitelisted });
  } catch (error) {
    console.error('Error checking whitelist:', error);
    return NextResponse.json({ error: 'Failed to check whitelist status' }, { status: 500 });
  }
}