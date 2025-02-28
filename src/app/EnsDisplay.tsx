"use client";
import { useState, useEffect } from 'react';
import { useAccount, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { getEnsName } from './ensUtils';

export function EnsDisplay() {
  const { address, isConnected } = useAccount();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarErrorMessage, setAvatarErrorMessage] = useState<string | null>(null); // New state
  const { data: avatarUrl, isLoading: avatarLoading, error: avatarError } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  });

  useEffect(() => {
    async function fetchEnsData() {
      if (isConnected && address) {
        setLoading(true);
        setError(null);
        try {
          const resolvedName = await getEnsName(address, process.env.NEXT_PUBLIC_ALCHEMY_ID);
          setEnsName(resolvedName);
          if (resolvedName) {
            const audio = new Audio('/assets/beep.mp3');
            audio.play();
          }
        } catch (err) {
          console.error("Error fetching ENS data:", err);
          setError("Error fetching ENS data.");
        } finally {
          setLoading(false);
        }
      } else {
        setEnsName(null);
      }
    }

    fetchEnsData();
  }, [address, isConnected]);

  useEffect(() => {
    if (avatarError) {
      setAvatarErrorMessage(avatarError.message || String(avatarError)); // Stringify error
    } else {
      setAvatarErrorMessage(null);
    }
  }, [avatarError]);

  if (!isConnected) {
    return <p>Connect your wallet to see your ENS profile.</p>;
  }

  if (avatarErrorMessage) {
    return <p>Error fetching ENS avatar: {avatarErrorMessage}</p>;
  }

  if (error) {
    return <p>Error fetching ENS profile: {error}</p>;
  }

  if (loading) {
    return <p>Loading ENS profile...</p>;
  }

  return (
    <div>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="ENS Avatar"
          style={{ width: '100px', height: '100px', borderRadius: '50%' }}
        />
      )}
      {ensName ? <p>ENS Name: {ensName}</p> : <p>No ENS name found for {address}</p>}
    </div>
  );
}