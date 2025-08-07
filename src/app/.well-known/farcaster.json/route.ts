export async function GET() {
  const manifest = {
    miniapp: {
      version: "1",
      name: "Hello World Mini App",
      iconUrl: "https://b6ca83becc74.ngrok-free.app/icon.png",
      homeUrl: "https://b6ca83becc74.ngrok-free.app",
      description: "A simple Farcaster Mini App that says hello to the world",
      splashImageUrl: "https://b6ca83becc74.ngrok-free.app/splash.png",
      splashBackgroundColor: "#8B5CF6"
    }
  }

  return Response.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
