import { NextResponse } from 'next/server';
import { getRedisClient } from '@/app/redis';

export async function POST(request: Request) {
  try {
    const redis = await getRedisClient();
    const { ensName } = await request.json();

    if (!ensName) {
      return NextResponse.json({ error: 'ENS name is required' }, { status: 400 });
    }

    const isWhitelisted = await redis.get(`whitelisted:${ensName}`);

    if (isWhitelisted === 'true') {
      const lastChecked = await redis.get(`lastChecked:${ensName}`);
      const now = Date.now();
      const oneHour = 3600000;

      if (lastChecked && now - parseInt(lastChecked) < oneHour) {
        const remainingMinutes = Math.round((oneHour - (now - parseInt(lastChecked))) / 60000); // Calculate minutes
        return NextResponse.json({ isWhitelisted: true, alreadyChecked: true, remainingTime: remainingMinutes });
      } else {
        await redis.set(`lastChecked:${ensName}`, now.toString());
        return NextResponse.json({ isWhitelisted: true, alreadyChecked: false });
      }
    } else {
      return NextResponse.json({ isWhitelisted: false });
    }
  } catch (error) {
    console.error('Error fetching data from Redis:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}