import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { getUserRole } from '@/lib/auth';
import { getRemainingMessages } from '@/lib/usage';

export default async function DashboardPage() {
  const user = await currentUser();
  const role = await getUserRole();
  const remainingMessages = await getRemainingMessages(user!.id, role);
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="glass rounded-2xl p-8 shadow-xl border border-border flex flex-col items-start gap-2">
        <h1 className="text-hero gradient-text mb-2">Welcome back, {user?.firstName || 'there'}!</h1>
        <p className="text-body text-lg">Your MLB betting analytics dashboard for the 2025 season.</p>
      </section>

      {/* Quick Stats */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="glass rounded-xl p-6 flex flex-col gap-2 border border-border shadow-lg">
          <h3 className="text-subheading mb-2 gradient-text">Subscription</h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {role === 'free' && '🆓'}
              {role === 'pro' && '⭐'}
              {role === 'vip' && '💎'}
            </span>
            <span className="text-lg font-medium capitalize">{role} Plan</span>
          </div>
        </div>
        <div className="glass rounded-xl p-6 flex flex-col gap-2 border border-border shadow-lg">
          <h3 className="text-subheading mb-2 gradient-text">AI Messages</h3>
          <div className="text-2xl font-bold text-blue-400 gradient-text">
            {remainingMessages === Infinity ? '∞' : remainingMessages}
          </div>
          <p className="text-body">
            {remainingMessages === Infinity ? 'Unlimited' : 'remaining today'}
          </p>
        </div>
        <div className="glass rounded-xl p-6 flex flex-col gap-2 border border-border shadow-lg">
          <h3 className="text-subheading mb-2 gradient-text">Season Progress</h3>
          <div className="text-2xl font-bold text-green-400 gradient-text">2025</div>
          <p className="text-body">MLB Season Active</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="glass rounded-2xl p-8 border border-border shadow-xl">
        <h2 className="text-heading mb-6 gradient-text">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            href="/dashboard/games"
            className="glass rounded-xl p-6 flex flex-col items-start gap-2 border border-border shadow-md hover:scale-105 transition-transform duration-200 no-underline"
          >
            <div className="text-2xl mb-2">⚾</div>
            <h3 className="font-medium mb-1 gradient-text">Today's Games</h3>
            <p className="text-body text-sm">View schedules & matchups</p>
          </Link>
          <Link 
            href="/dashboard/lines"
            className="glass rounded-xl p-6 flex flex-col items-start gap-2 border border-border shadow-md hover:scale-105 transition-transform duration-200 no-underline"
          >
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium mb-1 gradient-text">Live Odds</h3>
            <p className="text-body text-sm">Track line movements</p>
          </Link>
          <Link 
            href="/chat"
            className="glass rounded-xl p-6 flex flex-col items-start gap-2 border border-border shadow-md hover:scale-105 transition-transform duration-200 no-underline"
          >
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-medium mb-1 gradient-text">AI Assistant</h3>
            <p className="text-body text-sm">Chat with MLB bot</p>
          </Link>
          <Link 
            href="/dashboard/projections"
            className="glass rounded-xl p-6 flex flex-col items-start gap-2 border border-border shadow-md hover:scale-105 transition-transform duration-200 no-underline"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium mb-1 gradient-text">Projections</h3>
            <p className="text-body text-sm">View AI projections</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
