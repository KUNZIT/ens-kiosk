// page.tsx

'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { EnsDisplay } from './EnsDisplay';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isUserFollowedByGrado } from './efpUtils';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [remainingTime, setRemainingTime] = useState(30);
  const router = useRouter();
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectCompleteRef = useRef(false);
  const [efpMessage, setEfpMessage] = useState('');
  const [timerSectors, setTimerSectors] = useState<number>();
  
  
  useEffect(() => {
    if (account.isConnected) {
      setRemainingTime(30);
      setTimerSectors(Array.from({ length: 30 }, (_, i) => i + 1));

      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            setTimerSectors(Array.from({ length: 30 }, (_, i) => i + 1)); // Initialize timerSectors
            return prevTime - 1;
          } else {
            clearInterval(timerIntervalRef.current!);
            return 0;
          }
        });
      }, 1000);

      timerTimeoutRef.current = setTimeout(() => {
        disconnect();
        disconnectCompleteRef.current = true;
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
        setTimerSectors(); // Clear timerSectors
      }
    };
  }, [account.isConnected, disconnect, router]);

  useEffect(() => {
    if (!account.isConnected && disconnectCompleteRef.current) {
      window.location.reload(); // Reload only after disconnect is complete
      disconnectCompleteRef.current = false; // Reset the flag
    }
  }, [account.isConnected]);



useEffect(() => {
    const checkEfpFollow = async () => {
      if (account.address) {
        try {
          const isFollowed = await isUserFollowedByGrado(account.address); // Assuming you have this function
          if (isFollowed) {
            setEfpMessage('grado.eth follows you!');
          } else {
            setEfpMessage('grado.eth does NOT follow you.');
          }
        } catch (error) {
          console.error('Error checking EFP follow status:', error);
          // Handle the error, e.g., show an error message
        }
      }
    };

    checkEfpFollow();
  }, [account.address]);


  return (
    <main className="flex min-h-screen flex-col items-center p-24">
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
              border: '2px solid white',
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
            <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl lg:static lg:w-auto  dark:from-black dark:to-transparent lg:!bg-red-200">
        {account.isConnected && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: '300px', height: '10px', backgroundColor: '#f0f0f0' }}>
              {timerSectors.map((sector) => (
                <div
                  key={sector}
                  style={{
                    width: `${100 / 30}%`,
                    height: '100%',
                    backgroundColor: 'green',
                  }}
                />
              ))}
            </div>

            <p>Time remaining: {remainingTime} seconds</p>
            <EnsDisplay efpMessage={efpMessage} />
          </div>
        )}
      </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '7rem', color: 'blue' }}>ENS KIOSK</h2>
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
                border: '1px solid white',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              
              onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'blue'; // Change background color on hover
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'black'; // Revert to original color
  }}>
              {connector.name}
            </button>
          ))}
        </div>
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <h2></h2>
        <EnsDisplay efpMessage={efpMessage} />
        
        
      </div>
      
      
    </div>
    </main>
  );
}

export default App;