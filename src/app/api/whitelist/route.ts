// app/api/whitelist/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/app/redis'; // Adjust the import path
import { checkIfWhitelisted } from '@/app/whitelist'; // Adjust the import path

export async function POST(request: Request) {
  try {
    const { ensName } = await request.json();
    const isWhitelisted = await checkIfWhitelisted(ensName);

    return NextResponse.json({ isWhitelisted });
  } catch (error) {
    console.error('Error checking whitelist:', error);
    return NextResponse.json({ error: 'Failed to check whitelist status' }, { status: 500 });
  }
}