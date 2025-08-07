import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Gammabots - Trading Bot Platform",
  description: "Trading Bots Made Easy - Create and manage automated trading bots on Farcaster",
  openGraph: {
    title: "Gammabots - Trading Bot Platform",
    description: "Trading Bots Made Easy - Create and manage automated trading bots on Farcaster",
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://b6ca83becc74.ngrok-free.app/og-image.png",
      button: {
        title: "Launch Gammabots",
        action: {
          type: "launch_frame",
          name: "Gammabots - Trading Bot Platform",
          url: "https://b6ca83becc74.ngrok-free.app",
          splashImageUrl: "https://b6ca83becc74.ngrok-free.app/splash.png",
          splashBackgroundColor: "#8B5CF6"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-inter`}
      >
        {children}
      </body>
    </html>
  );
}
