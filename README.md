# Hello World Farcaster Mini App

A simple Farcaster Mini App built with Next.js, TypeScript, and the Farcaster Mini App SDK that displays "Hello, world!" when loaded.

## Features

- 🌍 Displays "Hello, world!" message
- 🎯 Detects Farcaster Mini App environment vs regular browser
- ⚡ Built with Next.js 15 and Turbopack for fast development
- 🎨 Styled with Tailwind CSS
- 📱 Responsive design
- 🔧 TypeScript for type safety

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Farcaster Mini App Integration

This app includes:

- **SDK Integration**: Uses `@farcaster/miniapp-sdk` for Farcaster-specific functionality
- **Manifest File**: Configured at `public/.well-known/farcaster.json`
- **Embed Metadata**: Includes `fc:miniapp` meta tags for social sharing
- **Environment Detection**: Handles both Mini App and browser environments

### Key Files

- `src/components/MiniApp.tsx` - Main Mini App component that calls `sdk.actions.ready()`
- `src/app/layout.tsx` - Contains Farcaster embed metadata
- `public/.well-known/farcaster.json` - Farcaster manifest configuration

## Development

The app automatically detects if it's running in a Farcaster Mini App environment and calls `sdk.actions.ready()` to hide the splash screen when ready.

For testing in the Farcaster environment, you'll need to:
1. Deploy your app to a public URL
2. Configure the manifest with your actual domain
3. Use the Farcaster Mini App preview tools

## Learn More

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Farcaster SDK](https://github.com/farcasterxyz/miniapps)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
