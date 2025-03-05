"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { getEnsName } from './ensUtils';
import WhitelistedModal from './WhitelistedModal';
import NotWhitelistedModal from './NotWhitelistedModal';
import IsCheckedModal from './IsCheckedModal';

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
  const [isNotWhitelistedModalOpen, setIsNotWhitelistedModalOpen] = useState(false);
  const [isAlreadyCheckedModalOpen, setIsAlreadyCheckedModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [remainingCheckTime, setRemainingCheckTime] = useState(0);
  const [initialCheckTime, setInitialCheckTime] = useState(0); // Store initial time
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null); // Use useRef for timer

  const handleWhitelisted = useCallback((ensName: string) => {
    setModalMessage(`${ensName} is whitelisted!`);
    setIsWhitelistedModalOpen(true);
  }, []);

  const handleNotWhitelisted = useCallback((ensName: string) => {
    setModalMessage(`${ensName} is not whitelisted.`);
    setIsNotWhitelistedModalOpen(true);
  }, []);

  const handleAlreadyChecked = useCallback((time: number) => {
    setInitialCheckTime(time);
    setRemainingCheckTime(time);
    setIsAlreadyCheckedModalOpen(true);
  }, []);

  const closeWhitelistedModal = () => {
    setIsWhitelistedModalOpen(false);
  };

  const closeNotWhitelistedModal = () => {
    setIsNotWhitelistedModalOpen(false);
  };

  const closeAlreadyCheckedModal = () => {
    setIsAlreadyCheckedModalOpen(false);
  };

  useEffect(() => {
    async function fetchEnsData() {
      if (isConnected && address) {
        setLoading(true);
        setError(null);
        try {
          const resolvedName = await getEnsName(address, process.env.NEXT_PUBLIC_ALCHEMY_ID);
          setEnsName(resolvedName);
          console.log("Fetched ENS Name:", resolvedName);
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
          console.log("Checking whitelist for:", ensName);
          const response = await fetch('/api/whitelist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ensName }),
          });
          const data = await response.json();
          console.log("API response:", data);
          if (data.isWhitelisted) {
            if (data.alreadyChecked) {
              handleAlreadyChecked(data.remainingTime);
            } else {
              handleWhitelisted(ensName);
            }
          } else {
            handleNotWhitelisted(ensName);
          }
        } catch (error) {
          console.error("Error checking whitelist:", error);
        }
      }
    };

    checkWhitelist();
  }, [ensName, handleWhitelisted, handleNotWhitelisted, handleAlreadyChecked]);

  useEffect(() => {
    if (isAlreadyCheckedModalOpen) {
      timerRef.current = setInterval(() => {
        setRemainingCheckTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timerRef.current!);
            return 0;
          }
        });
      }, 3600000); // 1 hour in milliseconds

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRemainingCheckTime(initialCheckTime);
    }
  }, [isAlreadyCheckedModalOpen, initialCheckTime]);

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
      {isWhitelistedModalOpen && <WhitelistedModal message={modalMessage} />}
      {isNotWhitelistedModalOpen && <NotWhitelistedModal message={modalMessage} />}
      {isAlreadyCheckedModalOpen && <IsCheckedModal remainingTime={remainingCheckTime} />}
    </div>
  );
}