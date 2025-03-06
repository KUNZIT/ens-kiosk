'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { EnsDisplay } from './EnsDisplay';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [remainingTime, setRemainingTime] = useState(30);
  const router = useRouter();
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectCompleteRef = useRef(false); // Add ref to track disconnection

  useEffect(() => {
    if (account.isConnected) {
      setRemainingTime(30);
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timerIntervalRef.current!);
            return 0;
          }
        });
      }, 1000);

      timerTimeoutRef.current = setTimeout(() => {
        disconnect();
        disconnectCompleteRef.current = true; // Set flag when disconnect is initiated
      }, 30000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current);
        timerTimeoutRef.current = null;
      }
      setRemainingTime(30);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current);
      }
    };
  }, [account.isConnected, disconnect, router]);

  useEffect(() => {
    if (!account.isConnected && disconnectCompleteRef.current) {
      window.location.reload(); // Reload only after disconnect is complete
      disconnectCompleteRef.current = false; // Reset the flag
    }
  }, [account.isConnected]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div>
        <h2></h2>
        <div>
          {/* Empty div */}
        </div>
        {account.status === 'connected' && (
          <>
            <button type="button" onClick={() => disconnect()}style={{
              padding: '0.5rem 1rem', // Adjust padding
              fontSize: '1rem', // Adjust font size
              backgroundColor: 'black', // Red background color
              color: 'white',
              border: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
             onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'red'; // Change background color on hover
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'black'; // Revert to original color
  }}>
              Disconnect
              
              
            </button>
            <div>Time remaining: {remainingTime} seconds</div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>ENS KIOSK</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                console.log('Connecting with:', connector.name);
                connect({ connector });
              }}
              type="button"
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                backgroundColor: 'black',
                color: 'white',
                border: 'white',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {connector.name}
            </button>
          ))}
        </div>
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <h2></h2>
        <EnsDisplay />
      </div>
    </div>
  );
}

export default App;