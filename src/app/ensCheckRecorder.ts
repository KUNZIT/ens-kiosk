// app/ensCheckRecorder.ts
import { getRedisClient } from './redis'; // Assuming redis.ts is in the same app directory

const LOG_LIST_KEY = 'ens_success_log'; // Name of the Redis list to store logs

/**
 * Formats a Date object into HH:MM:SS string.
 * @param date The Date object to format.
 * @returns A string representing the time in HH:MM:SS format.
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a Date object into DD-MM-YYYY string.
 * @param date The Date object to format.
 * @returns A string representing the date in DD-MM-YYYY format.
 */
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Records a successful ENS check with server timestamp and ENS name into a Redis list.
 * The format stored will be: \HH:MM:SS\DD-MM-YYYY\ensName.eth
 *
 * @param ensName The ENS name that was successfully checked.
 * @returns Promise<void>
 * @throws Error if failed to record to Redis.
 */
export async function recordSuccessfulEnsCheck(ensName: string): Promise<void> {
  console.log(`Attempting to record successful check for ENS name: ${ensName}`);
  try {
    const redis = await getRedisClient();
    const now = new Date(); // Gets current server date and time

    const timeString = formatTime(now);
    const dateString = formatDate(now);

    const record = `\\${timeString}\\${dateString}\\${ensName}`;

    // Append the record to the end of the list
    await redis.rPush(LOG_LIST_KEY, record);

    console.log(`Successfully recorded for ${ensName}: ${record}`);

  } catch (error) {
    console.error(`Error recording successful check for ${ensName}:`, error);
    // Depending on your application's needs, you might want to re-throw
    // or handle this more gracefully (e.g., log to a fallback).
    throw new Error(`Failed to record successful check for ${ensName}`);
  }
}

/**
 * Optional: Function to retrieve all recorded successful checks.
 * @returns Promise<string[]> A list of all recorded checks.
 * @throws Error if failed to retrieve from Redis.
 */
export async function getSuccessfulEnsCheckRecords(): Promise<string[]> {
  try {
    const redis = await getRedisClient();
    // Get all elements from the list. For very long lists, consider pagination (lrange with start/stop).
    const records = await redis.lRange(LOG_LIST_KEY, 0, -1);
    return records;
  } catch (error) {
    console.error('Error retrieving successful check records:', error);
    throw new Error('Failed to retrieve successful check records');
  }
}
