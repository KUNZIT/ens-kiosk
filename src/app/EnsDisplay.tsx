"use client";
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useAccount, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { getEnsName } from './ensUtils';
import WhitelistedModal from './WhitelistedModal';
import NotWhitelistedModal from './NotWhitelistedModal'; // Import the new modal

export function EnsDisplay() {
  const { address, isConnected } = useAccount();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarErrorMessage, setAvatarErrorMessage] = useState<string | null>(null);
  const { data: avatarUrl, isLoading: avatarLoading, error: avatarError } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  });

  const [isWhitelistedModalOpen, setIsWhitelistedModalOpen] = useState(false);
  const [isNotWhitelistedModalOpen, setIsNotWhitelistedModalOpen] = useState(false); // New modal state
  const [modalMessage, setModalMessage] = useState('');

  const handleWhitelisted = useCallback((ensName: string) => { // Use useCallback
    setModalMessage(`${ensName} is whitelisted!`);
    setIsWhitelistedModalOpen(true);
  }, []);

  const handleNotWhitelisted = useCallback((ensName: string) => { // Use useCallback
      setModalMessage(`${ensName} is not whitelisted.`);
      setIsNotWhitelistedModalOpen(true);
  }, []);

  const closeWhitelistedModal = () => {
    setIsWhitelistedModalOpen(false);
  };

  const closeNotWhitelistedModal = () => { // New modal close function
    setIsNotWhitelistedModalOpen(false);
  };

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
      setAvatarErrorMessage(avatarError.message || String(avatarError));
    } else {
      setAvatarErrorMessage(null);
    }
  }, [avatarError]);

  useEffect(() => {
    const checkWhitelist = async () => {
      if (ensName) {
        try {
          const response = await fetch('/api/whitelist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ensName }),
          });
          const data = await response.json();
          if (data.isWhitelisted) {
            handleWhitelisted(ensName); // Open Whitelisted Modal
          } else {
            handleNotWhitelisted(ensName); // Open Not Whitelisted Modal
          }
        } catch (error) {
          console.error("Error checking whitelist:", error);
        }
      }
    };

    checkWhitelist();
  }, [ensName, handleWhitelisted, handleNotWhitelisted]); // Add handleNotWhitelisted to dependency array

  if (!isConnected) {
    return <p>Connect your wallet to see your ENS profile.</p>;
  }

  if (avatarErrorMessage) {
    return <p>Error fetching ENS avatar: {avatarErrorMessage}</p>;
  }

  if (error) {
    return <p>Error fetching ENS profile: {error}</p>;
  }

  if (loading || avatarLoading) {
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
      {isWhitelistedModalOpen && <WhitelistedModal message={modalMessage} onClose={closeWhitelistedModal} />}
      {isNotWhitelistedModalOpen && <NotWhitelistedModal message={modalMessage} onClose={closeNotWhitelistedModal} />}
    </div>
  );
}