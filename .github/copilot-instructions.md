<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Farcaster Mini App Development

This is a Farcaster Mini App built with Next.js and TypeScript. 

## Key Guidelines:

- Always call `sdk.actions.ready()` after the app is fully loaded to hide the splash screen
- Use the `@farcaster/miniapp-sdk` for all Farcaster-specific functionality
- Follow Farcaster Mini App best practices from the official documentation
- The manifest file at `public/.well-known/farcaster.json` must be properly configured
- Include `fc:miniapp` meta tags for social sharing
- Use TypeScript for type safety
- Handle both Mini App and regular web browser environments gracefully

## Important Files:

- `src/components/MiniApp.tsx` - Main Mini App component
- `public/.well-known/farcaster.json` - Farcaster manifest
- `src/app/layout.tsx` - Contains embed metadata
