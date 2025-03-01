// app/InitializeWhitelist.tsx
'use client';

import { useEffect } from 'react';

export default function InitializeWhitelist() {
    useEffect(() => {
        async function initialize() {
            try {
                await fetch('/api/initializeWhitelist');
                console.log('Default names added to whitelist.');
            } catch (error) {
                console.error('Error adding default names:', error);
            }
        }

        initialize();
    }, []);

    return null;
}