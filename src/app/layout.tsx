import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
      imageUrl: "https://gammabots-mini-app.vercel.app/og-image.png",
      button: {
        title: "Launch Gammabots",
        action: {
          type: "launch_frame",
          name: "Gammabots - Trading Bot Platform",
          url: "https://gammabots-mini-app.vercel.app",
          splashImageUrl: "https://gammabots-mini-app.vercel.app/splash.png",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
