// Add this to your ENS recorder app: /api/server-time/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const serverTime = new Date();
  
  return NextResponse.json({
    serverTime: serverTime.toISOString(),
    timestamp: serverTime.getTime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
