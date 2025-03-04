'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { EnsDisplay } from './EnsDisplay';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [timerActive, setTimerActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30); // Initialize with 30 seconds
  const router = useRouter();

  console.log('Connectors:', connectors);

  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    let timerTimeout: ReturnType<typeof setTimeout> | null = null;

    if (account.isConnected && !timerActive) {
      setTimerActive(true);
      setRemainingTime(30); // Reset timer

      timerInterval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);

      timerTimeout = setTimeout(() => {
        disconnect();
        router.refresh();
        setTimerActive(false);
        clearInterval(timerInterval!);
        setRemainingTime(30); // Reset timer
      }, 30000);

      return () => {
        if (timerTimeout) clearTimeout(timerTimeout);
        if (timerInterval) clearInterval(timerInterval);
        setTimerActive(false);
        setRemainingTime(30); // Reset timer
      };
    }
    if(!account.isConnected){
      setTimerActive(false);
      setRemainingTime(30);
      if(timerInterval) clearInterval(timerInterval);
      if(timerTimeout) clearTimeout(timerTimeout);
    }
  }, [account.isConnected, disconnect, router, timerActive]);

  return (
    <>
      <div>
        <h2>Account</h2>
        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>
        {account.status === 'connected' && (
          <>
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>
            {timerActive && <div>Time remaining: {remainingTime} seconds</div>}
          </>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => {
              console.log('Connecting with:', connector.name);
              connect({ connector });
            }}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <h2>ENS Display</h2>
        <EnsDisplay />
      </div>
    </>
  );
}

export default App;