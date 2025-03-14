// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { type ReactNode } from 'react';

import { Providers } from './providers';
import InitializeWhitelist from "./InitializeWhitelist";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'ENS KIOSK',
    description: 'Generated by grado.eth',
};

export default function RootLayout(props: { children: ReactNode }) {
    return (
        <html lang="en">
        
        <head>
                {/* Existing metadata from 'next/head' will be here */}
                <link rel="icon" href="/assets/logo.jpg" /> {/* Add your favicon link here */}
            </head>
        
        
        
            <body className={inter.className}>
                <Providers>
                    <InitializeWhitelist/>
                    {props.children}
                </Providers>
            </body>
        </html>
    );
}