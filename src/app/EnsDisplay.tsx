// EnsDisplay.tsx

"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { getEnsName } from './ensUtils';
import WhitelistedModal from './WhitelistedModal';
import NotWhitelistedModal from './NotWhitelistedModal';
import { isUserFollowedByGrado } from './efpUtils';

interface EnsDisplayProps {
  efpMessage: string; // Add efpMessage to the props type
}

export function EnsDisplay({ efpMessage }: EnsDisplayProps) { // Add efpMessage to the props
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
  const [isFirstTimeWhitelisted, setIsFirstTimeWhitelisted] = useState(false);

  const handleWhitelisted = useCallback((ensName: string, remainingTime?: number) => {
    console.log("handleWhitelisted called:", ensName, "remainingTime:", remainingTime);
    setModalMessage(`${ensName} is whitelisted!`);
    setRemainingCheckTime(remainingTime);
    if (remainingTime === undefined) {
      setIsFirstTimeWhitelisted(true);
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
    setIsFirstTimeWhitelisted(false);
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

  useEffect(() => {
    const checkEfpFollow = async () => {
      if (address) {
        try {
          const isFollowed = await isUserFollowedByGrado(address);
          if (isFollowed) {
            // setEfpMessage('grado.eth follows you!'); No longer needed here.
          } else {
            // setEfpMessage('grado.eth does NOT follow you.'); No longer needed here.
          }
        } catch (error) {
          console.error('Error checking EFP follow status:', error);
          // Handle the error, e.g., show an error message
        }
      }
    };

    checkEfpFollow();
  }, [address]);

  if (!isConnected) {
    return <p></p>;
  }

  if (avatarErrorMessage) {
    return <p>Error fetching ENS avatar: {avatarErrorMessage}</p>;
  }

  if (error) {
    return <p>Error fetching ENS profile: {error}</p>;
  }

  if (loading || avatarLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '15px solid green',
            animation: 'rotate 1s linear infinite',
          }}
        ></div>
        <p style={{ fontSize: '1.2em', color: 'white', marginLeft: '10px' }}>Loading ENS profile...</p>
      </div>
    );
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
      {isWhitelistedModalOpen && (
        <WhitelistedModal
          message={modalMessage}
          remainingTime={remainingCheckTime}
          efpMessage={efpMessage}
        />
      )}
      {isNotWhitelistedModalOpen && <NotWhitelistedModal message={modalMessage} />}
    </div>
  );
}