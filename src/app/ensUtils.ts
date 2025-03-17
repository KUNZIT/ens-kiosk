import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { JsonRpcProvider } from 'ethers';

export async function getEnsName(address: string, alchemyApiKey: string | undefined): Promise<string | null> {
  if (!alchemyApiKey) {
    return null;
  }

  try {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`),
    });

    const provider = new JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`);

    const ensName = await provider.lookupAddress(address);

    return ensName;
  } catch (error) {
    return null;
  }
}

interface Avatar {
  url: string;
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

    const avatar = await resolver.getAvatar() as Avatar | null;

    if (avatar && avatar.url) {
      return avatar.url;
    }

    return null;
  } catch (error) {
    return null;
  }
}
