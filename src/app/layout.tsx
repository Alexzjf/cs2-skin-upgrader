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
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-white font-sans">
        <header className="bg-[#111827]/90 backdrop-blur-md border-b border-[#1f2937] sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-yellow-400 rounded flex items-center justify-center font-bold text-[11px] text-black">
                CS2
              </div>
              <span className="text-lg font-bold text-white">
                Upgrader
              </span>
            </Link>

            <nav className="flex items-center gap-5">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Upgrader
              </Link>
              <Link
                href="/history"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                History
              </Link>
              <Link
                href="/fair"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Fair
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-[#0b0f19] border-t border-[#1f2937] py-5 mt-auto">
          <div className="max-w-6xl mx-auto px-4 text-center text-xs text-gray-600">
            CS2 Skin Upgrader — Demo. Not affiliated with Valve.
          </div>
        </footer>
      </body>
    </html>
  );
}
