import { NextResponse } from 'next/server';
import { getRedisClient } from '@/app/redis';
import { recordSuccessfulEnsCheck, getSuccessfulEnsCheckRecords } from '@/app/ensCheckRecorder'; // Adjust the import path if needed

// POST request to record a successful ENS check
export async function POST(request: Request) {
  try {
    const { ensName } = await request.json();
    if (!ensName) {
      return NextResponse.json({ error: 'ENS name is required' }, { status: 400 });
    }
    await recordSuccessfulEnsCheck(ensName);
    return NextResponse.json({ message: 'Successfully recorded ENS check' });
  } catch (error: any) {
    console.error('Error recording successful ENS check:', error);
    return NextResponse.json({ error: error.message || 'Failed to record ENS check' }, { status: 500 });
  }
}

// GET request to retrieve all successful ENS check records
export async function GET() {
  try {
    const records = await getSuccessfulEnsCheckRecords();
    return NextResponse.json({ records });
  } catch (error: any) {
    console.error('Error retrieving successful ENS check records:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve records' }, { status: 500 });
  }
}
