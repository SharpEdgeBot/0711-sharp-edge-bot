import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";


// ChatOverlay widget removed

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLB Sharp Edge - Predictive Betting Analytics",
  description: "Advanced MLB betting analytics powered by AI and statistical modeling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`dark ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}
        >
          {/* Global header with glass morphism */}
          <header className="header glass w-full shadow-lg sticky top-0 z-50">
            <div className="px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-[var(--accent-blue)] tracking-wide">MLB Sharp Edge</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-[var(--bg-secondary)] text-[var(--accent-blue)] border border-[var(--accent-blue)] shadow">Premium</span>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
