// app/whitelistServer.ts
import { getRedisClient } from './redis';

export async function checkIfWhitelistedServer(ensName: string): Promise<boolean> {
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

export async function addEnsNameToWhitelistServer(ensName: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.set(`whitelisted:${ensName.toLowerCase()}`, 'true');
    console.log(`Added ${ensName} to whitelist.`);
  } catch (error) {
    console.error(`Error adding ${ensName} to whitelist:`, error);
    throw new Error(`Failed to add ${ensName} to whitelist`);
  }
}

export async function addDefaultNamesToWhitelistServer(): Promise<void> {
  const defaultNames = ['vitalik.eth', 'grado.eth', 'ens.eth', 'brantly.eth','jesse.eth','sargent.eth','designer.eth','efp.eth',
  'brianarmstrong.eth','broke.eth','bama.eth','cocoon.eth','acevod.eth','odie.eth','dima.eth','dons.eth','okarun.eth','autist.eth','wbush.eth' ];
  try {
    for (const name of defaultNames) {
      await addEnsNameToWhitelistServer(name);
    }
  } catch (error) {
    console.error('Error adding default names to whitelist:', error);
    throw new Error('Failed to add default names to whitelist');
  }
}