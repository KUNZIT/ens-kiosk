'use client';

import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { EnsDisplay } from './EnsDisplay';
import { checkIfWhitelisted } from './whitelist'; // Import whitelist function

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address: account.address });

  useEffect(() => {
    async function checkWhitelist() {
      if (ensName) {
        const isWhitelisted = await checkIfWhitelisted(ensName);
        if (isWhitelisted) {
          alert(`${ensName} is whitelisted!`);
        }
      }
    }
    checkWhitelist();
  }, [ensName]);

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