'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { EnsDisplay } from './EnsDisplay';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

console.log('Connectors:', connectors); // Log the connectors array

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
            onClick={() =>
            
            console.log('Connecting with:', connector.name); // Log the connector being used
             connect({ connector })}
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