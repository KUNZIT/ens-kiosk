'use client';

import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { EnsDisplay } from './EnsDisplay';
import { useState } from 'react';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address: account.address });
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  useEffect(() => {
    async function checkWhitelist() {
      if (ensName) {
      
      const response = await fetch('/api/whitelist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ensName }),
        });
        const data = await response.json();
        setIsWhitelisted(data.isWhitelisted);
      }
    }
    checkWhitelist();
  }, [ensName]);

  useEffect(() => {
    if (isWhitelisted === true) {
      alert(`${ensName} is whitelisted!`);
    }
  }, [isWhitelisted, ensName]);

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
            onClick={() => connect({ connector })}
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