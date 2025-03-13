

# ens-kiosk
Display ENS name and verify if whitelisted

https://ens-kiosk.vercel.app

![q](https://github.com/user-attachments/assets/e50d542f-f1d3-4a55-ac94-30e5849de8ae)


This Next.js application verifies if the user is whitelisted in a Redis database,
 and shows EFP (Ethereum Follow Protocol) data.
 
It will play audio alerts (beep) if the connected wallet meets these three requirements:

1. The user's ENS name is included in the database.
2. The user's wallet is connected for the first time within a specific time period.
3. The user's ENS name is followed by grado.eth on EFP.

## Potential Use Case

This application can be deployed in a vending machine to distribute water or other products
 based on unique ENS identity and Ethereum Follow Protocol data.

## Environment Variables

1. Reown (WalletConnect) Project ID
2. Alchemy API Key
3 .Redis database URL

Ethereum Follow Protocol integration : src/app/efpUtils.ts Please change for your needs
EFP public API endpoint `https://api.ethfollow.xyz/api/v1/users/grado.eth/following?limit=2000`

## Installation

This project uses pnpm for package management.

1. Install pnpm: `npm install -g pnpm`
2. Install dependencies: `pnpm install`
3. `pnpm run dev`: Start the development server