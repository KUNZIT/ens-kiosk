"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { getEnsName } from './ensUtils';
import WhitelistedModal from './WhitelistedModal';
import NotWhitelistedModal from './NotWhitelistedModal';

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
  const [modalMessage, setModalMessage] = useState('');
  const [remainingCheckTime, setRemainingCheckTime] = useState<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isFirstTimeWhitelisted, setIsFirstTimeWhitelisted] = useState(false); // Add this state

  const handleWhitelisted = useCallback((ensName: string, remainingTime?: number) => {
    console.log("handleWhitelisted called:", ensName, "remainingTime:", remainingTime);
    setModalMessage(`${ensName} is whitelisted!`);
    setRemainingCheckTime(remainingTime);
    if (remainingTime === undefined) {
      setIsFirstTimeWhitelisted(true); // Set to true only if remainingTime is undefined
    } else {
      setIsFirstTimeWhitelisted(false);
    }
    setIsWhitelistedModalOpen(true);
  }, []);

  const handleNotWhitelisted = useCallback((ensName: string) => {
    console.log("handleNotWhitelisted called:", ensName);
    setModalMessage(`${ensName} is not whitelisted.`);
    setIsNotWhitelistedModalOpen(true);
  }, []);

  const closeWhitelistedModal = () => {
    setIsWhitelistedModalOpen(false);
    setRemainingCheckTime(undefined);
    setIsFirstTimeWhitelisted(false); // Reset when modal is closed
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const closeNotWhitelistedModal = () => {
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
          console.log("Fetched ENS Name:", resolvedName);
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
            handleWhitelisted(ensName, data.remainingTime);
          } else {
            handleNotWhitelisted(ensName);
          }
        } catch (error) {
          console.error("Error checking whitelist:", error);
        }
      }
    };

    checkWhitelist();
  }, [ensName, handleWhitelisted, handleNotWhitelisted]);

  useEffect(() => {
    if (isWhitelistedModalOpen && remainingCheckTime !== undefined) {
      console.log("Starting timer, remainingCheckTime:", remainingCheckTime);
      timerRef.current = setInterval(() => {
        setRemainingCheckTime((prevTime) => {
          if (prevTime && prevTime > 0) {
            console.log("Remaining time:", prevTime - 1);
            return prevTime - 1;
          } else {
            console.log("Timer finished");
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return undefined;
          }
        });
      }, 60000); // 1 minute

      return () => {
        if (timerRef.current) {
          console.log("Clearing timer");
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isWhitelistedModalOpen, remainingCheckTime]);

  useEffect(() => {
    if (isWhitelistedModalOpen && isFirstTimeWhitelisted) {
      const audio = new Audio('/assets/beep.mp3');
      audio.play();
    }
  }, [isWhitelistedModalOpen, isFirstTimeWhitelisted]);

  if (!isConnected) {
    return <p>Connect your wallet profile.</p>;
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
      {isWhitelistedModalOpen && <WhitelistedModal message={modalMessage} remainingTime={remainingCheckTime} />}
      {isNotWhitelistedModalOpen && <NotWhitelistedModal message={modalMessage} />}
    </div>
  );
}