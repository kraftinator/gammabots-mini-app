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
  title: "Gammabots",
  description: "Deploy automated trading bots in seconds. Choose a strategy, fund your bot, and let it trade for you.",
  openGraph: {
    title: "Gammabots",
    description: "Deploy automated trading bots in seconds. Choose a strategy, fund your bot, and let it trade for you.",
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://gammabots.io/preview-image.png",
      button: {
        title: "Launch Gammabots",
        action: {
          type: "launch_frame",
          name: "Gammabots",
          url: "https://gammabots.io/mini-app",
          splashImageUrl: "https://gammabots.io/splash.png",
          splashBackgroundColor: "#2d3f54"
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
