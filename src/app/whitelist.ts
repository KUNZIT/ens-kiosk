// app/whitelist.ts
import { getRedisClient } from './redis';

export async function checkIfWhitelisted(ensName: string): Promise<boolean> {
  console.log(`Checking whitelist status for ENS name: ${ensName}`);
  try {
    const redis = await getRedisClient();
    const isWhitelisted = await redis.get(`whitelist:${ensName.toLowerCase()}`);
    console.log(`Whitelist status for ${ensName}: ${isWhitelisted}`);

    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode detected, adding example data if needed');
      const exampleNames = ['vitalik.eth', 'grado.eth', 'ens.eth'];
      for (const name of exampleNames) {
        await redis.set(`whitelist:${name}`, 'true');
      }

      if (!isWhitelisted && exampleNames.includes(ensName.toLowerCase())) {
        console.log(`Adding ${ensName} to whitelist for testing`);
        await redis.set(`whitelist:${ensName.toLowerCase()}`, 'true');
        return true;
      }
    }

    return !!isWhitelisted;
  } catch (error) {
    console.error('Error checking whitelist:', error);
    throw new Error('Failed to check whitelist status');
  }
}