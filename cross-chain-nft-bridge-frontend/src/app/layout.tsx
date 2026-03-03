import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cross-chain NFT Bridge",
  description:
    "Bridge NFTs between Polkadot parachains and EVM chains with a clean, YC-style interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${mono.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        <div className="min-h-screen bg-white">
          <div className="relative">{children}</div>
        </div>
      </body>
    </html>
  );
}
