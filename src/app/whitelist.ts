// app/whitelist.ts
import { getRedisClient } from './redis';

export async function checkIfWhitelisted(ensName: string): Promise<boolean> {
  console.log(`Checking whitelist status for ENS name: ${ensName}`);
  try {
    const redis = await getRedisClient();
    const isWhitelisted = await redis.get(`whitelisted:${ensName.toLowerCase()}`);
    console.log(`Whitelist status for ${ensName}: ${isWhitelisted}`);
    return isWhitelisted === 'true';
  } catch (error) {
    console.error('Error checking whitelist:', error);
    throw new Error('Failed to check whitelist status');
  }
}

export async function addEnsNameToWhitelist(ensName: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.set(`whitelisted:${ensName.toLowerCase()}`, 'true');
    console.log(`Added ${ensName} to whitelist.`);
  } catch (error) {
    console.error(`Error adding ${ensName} to whitelist:`, error);
    throw new Error(`Failed to add ${ensName} to whitelist`);
  }
}

export async function addDefaultNamesToWhitelist(): Promise<void> {
  const defaultNames = ['vitalik.eth', 'grado.eth', 'ens.eth'];
  try {
    for (const name of defaultNames) {
      await addEnsNameToWhitelist(name);
    }
  } catch (error) {
    console.error('Error adding default names to whitelist:', error);
    throw new Error('Failed to add default names to whitelist');
  }
}

