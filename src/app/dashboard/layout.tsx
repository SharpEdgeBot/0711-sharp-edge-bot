
"use client";
import { UserButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { getUserRoleClient } from '@/lib/auth';



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (user) {
        // getUserRoleClient should be a client-side function
        const r = await getUserRoleClient();
        setRole(r);
      }
    }
    fetchRole();
  }, [user]);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">Please sign in to access the dashboard.</p>
          <Link href="/">
            <button className="modern-btn">Go to Homepage</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      {/* Sidebar - Premium Glass Morphism */}
      <aside className="sidebar glass-morph flex flex-col justify-between py-8 px-4 w-72 min-h-screen shadow-xl fixed left-0 top-0 z-40 h-screen">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-purple)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">⚾</span>
            </div>
            <h1 className="text-xl font-bold tracking-wide text-[var(--accent-primary)]">MLB Sharp Edge</h1>
          </Link>
          <nav className="space-y-2">
            <Link href="/dashboard" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition">
              <span className="text-lg">📊</span>
              <span>Overview</span>
            </Link>
            <Link href="/dashboard/games" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition">
              <span className="text-lg">⚾</span>
              <span>Games</span>
            </Link>
            {/* Removed Lines & Odds link; use Betting Lines below */}
            <Link href="/betting-lines" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 hover:text-white transition">
              <span className="text-lg">�</span>
              <span>Betting Lines</span>
            </Link>
            <Link 
              href="/dashboard/props" 
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition ${role !== 'vip' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white'}`}
            >
              <span className="text-lg">🎯</span>
              <span>Player Props {role !== 'vip' && <span className="ml-1 text-xs">(VIP)</span>}</span>
            </Link>
            <Link href="/dashboard/projections" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-600 hover:text-white transition">
              <span className="text-lg">🤖</span>
              <span>AI Projections</span>
            </Link>
            <Link href="/chat" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500 hover:text-white transition">
              <span className="text-lg">💬</span>
              <span>AI Assistant</span>
            </Link>
          </nav>
        </div>
        <div className="flex flex-col items-center gap-4 mt-10">
          <UserButton afterSignOutUrl="/" />
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: '18rem' }}>
        <main className="main-content flex-1 p-8 bg-[var(--bg-primary)]">
          {children}
        </main>
      </div>
    </div>
  );
}

