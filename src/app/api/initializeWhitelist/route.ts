// app/api/initializeWhitelist/route.ts
import { addDefaultNamesToWhitelistServer } from '../../whitelistServer';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await addDefaultNamesToWhitelistServer();
        return NextResponse.json({ message: 'Default names added' });
    } catch (error) {
        console.error('API Error adding default names:', error);
        return NextResponse.json({ error: 'Failed to add default names' }, { status: 500 });
    }
}