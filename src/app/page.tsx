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
  const router = useRouter();

  console.log('Connectors:', connectors); // Log the connectors array

  useEffect(() => {
    if (account.isConnected && !timerActive) {
      setTimerActive(true);
      const timer = setTimeout(() => {
        disconnect();
        router.refresh(); // Refresh the page after disconnect
        setTimerActive(false);
      }, 30000); // 30 seconds

      return () => {
        clearTimeout(timer);
        setTimerActive(false);
      };
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
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
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