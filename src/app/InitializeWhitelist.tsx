// app/InitializeWhitelist.tsx
'use client';

import { useEffect } from 'react';
import { addDefaultNamesToWhitelist } from './whitelist';

export default function InitializeWhitelist() {
    useEffect(() => {
        async function initialize() {
            try {
                await addDefaultNamesToWhitelist();
                console.log('Default names added to whitelist.');
            } catch (error) {
                console.error('Error adding default names:', error);
            }
        }

        initialize();
    }, []);

    return null; // This component doesn't render anything
}