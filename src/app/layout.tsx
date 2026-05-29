import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CS2 Skin Upgrader",
  description:
    "Upgrade your CS2 skins! Pick a cheap skin, choose an expensive target, and try your luck with provably fair rolls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a1a] text-white font-sans">
        <header className="bg-[#1a1a2e] border-b border-[#2a2a4a] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center font-bold text-sm text-black">
                UP
              </div>
              <span className="text-xl font-bold text-white">
                CS2 <span className="text-orange-400">Upgrader</span>
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-300 hover:text-orange-400 transition-colors font-medium text-sm"
              >
                Upgrader
              </Link>
              <Link
                href="/history"
                className="text-gray-300 hover:text-orange-400 transition-colors font-medium text-sm"
              >
                History
              </Link>
              <Link
                href="/fair"
                className="text-gray-300 hover:text-orange-400 transition-colors font-medium text-sm"
              >
                Provably Fair
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-[#0f0f20] border-t border-[#2a2a4a] py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            CS2 Skin Upgrader &mdash; Demo Project. Not affiliated with Valve.
          </div>
        </footer>
      </body>
    </html>
  );
}
