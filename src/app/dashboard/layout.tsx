import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { getUserRole } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const role = await getUserRole();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚾</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">MLB Sharp Edge</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {role === 'free' && 'Free Plan'}
              {role === 'pro' && '⭐ Pro Plan'}
              {role === 'vip' && '💎 VIP Plan'}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            <Link 
              href="/dashboard" 
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors"
            >
              📊 Overview
            </Link>
            <Link 
              href="/dashboard/games" 
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors"
            >
              ⚾ Games
            </Link>
            <Link 
              href="/dashboard/lines" 
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors"
            >
              📈 Lines & Odds
            </Link>
            <Link 
              href="/dashboard/props" 
              className={`block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors ${
                role !== 'vip' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              🎯 Player Props {role !== 'vip' && '(VIP)'}
            </Link>
            <Link 
              href="/dashboard/projections" 
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors"
            >
              🧠 AI Projections
            </Link>
            <Link 
              href="/chat" 
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors"
            >
              💬 AI Assistant
            </Link>
            
            <div className="pt-4 border-t">
              <Link 
                href="/account" 
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors"
              >
                ⚙️ Account
              </Link>
              {role === 'free' && (
                <Link 
                  href="/pricing" 
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors font-medium"
                >
                  ⬆️ Upgrade
                </Link>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
