import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { getUserRole } from '@/lib/auth';

import ThemeToggle from '@/components/ThemeToggle';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const role = await getUserRole();

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Sidebar - Premium Glass Morphism */}
      <aside className="sidebar glass flex flex-col justify-between py-8 px-4 w-72 min-h-screen shadow-xl">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-green)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">⚾</span>
            </div>
            <h1 className="text-xl font-bold tracking-wide text-[var(--accent-blue)]">MLB Sharp Edge</h1>
          </Link>
          <nav className="space-y-2">
            <Link href="/dashboard" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--accent-blue)] hover:text-[var(--background)] transition">
              <span className="text-lg">📊</span>
              <span>Overview</span>
            </Link>
            <Link href="/dashboard/games" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--accent-blue)] hover:text-[var(--background)] transition">
              <span className="text-lg">⚾</span>
              <span>Games</span>
            </Link>
            <Link href="/dashboard/lines" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--accent-blue)] hover:text-[var(--background)] transition">
              <span className="text-lg">📈</span>
              <span>Lines & Odds</span>
            </Link>
            <Link 
              href="/dashboard/props" 
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition ${role !== 'vip' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--accent-blue)] hover:text-[var(--background)]'}`}
            >
              <span className="text-lg">🎯</span>
              <span>Player Props {role !== 'vip' && <span className="ml-1 text-xs">(VIP)</span>}</span>
            </Link>
            <Link href="/dashboard/projections" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--accent-blue)] hover:text-[var(--background)] transition">
              <span className="text-lg">🤖</span>
              <span>AI Projections</span>
            </Link>
            <Link href="/chat" className="nav-item flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--accent-blue)] hover:text-[var(--background)] transition">
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
      <div className="flex-1 flex flex-col">
        {/* Header - Premium Style */}
        <header className="header glass w-full shadow-lg">
          <div className="px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-[var(--accent-blue)] tracking-wide">Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 text-sm font-semibold rounded-full bg-[var(--bg-secondary)] text-[var(--accent-blue)] border border-[var(--accent-blue)] shadow">
                {role === 'free' && '🆓 Free Plan'}
                {role === 'pro' && '⭐ Pro Plan'}
                {role === 'vip' && '💎 VIP Plan'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content flex-1 p-8 bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}

