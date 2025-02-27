// app/ensUtils.ts
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { JsonRpcProvider } from 'ethers'; // Correct import

export async function getEnsName(address: string, alchemyApiKey: string | undefined): Promise<string | null> {
  if (!alchemyApiKey) {
    console.error("Alchemy API key is missing.");
    return null;
  }

  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`),
    });

    const provider = new JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`); // Correct usage

    const ensName = await provider.lookupAddress(address);

    return ensName;
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    return null;
  }
}


export async function getEnsAvatar(ensName: string | null, alchemyApiKey: string | undefined): Promise<string | null> {
  if (!ensName || !alchemyApiKey) {
    return null;
  }

  try {
    const provider = new JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`);
    const resolver = await provider.getResolver(ensName);

    if (!resolver) {
      return null;
    }

    const avatar = await resolver.getAvatar();

    if (avatar) {
      return avatar.url;
    }

    return null;
  } catch (error) {
    console.error("Error fetching ENS avatar:", error);
    return null;
  }
}