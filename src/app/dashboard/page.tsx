import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { getUserRole } from '@/lib/auth';
import { getRemainingMessages } from '@/lib/usage';

export default async function DashboardPage() {
  const user = await currentUser();
  const role = await getUserRole();
  const remainingMessages = await getRemainingMessages(user!.id, role);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="text-gray-600">
          Your MLB betting analytics dashboard for the 2025 season.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription</h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {role === 'free' && '🆓'}
              {role === 'pro' && '⭐'}
              {role === 'vip' && '💎'}
            </span>
            <span className="text-lg font-medium capitalize">{role} Plan</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Messages</h3>
          <div className="text-2xl font-bold text-blue-600">
            {remainingMessages === Infinity ? '∞' : remainingMessages}
          </div>
          <p className="text-sm text-gray-600">
            {remainingMessages === Infinity ? 'Unlimited' : 'remaining today'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Season Progress</h3>
          <div className="text-2xl font-bold text-green-600">2025</div>
          <p className="text-sm text-gray-600">MLB Season Active</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/dashboard/games"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-2xl mb-2">⚾</div>
            <h3 className="font-medium">Today's Games</h3>
            <p className="text-sm text-gray-600">View schedules & matchups</p>
          </Link>

          <Link 
            href="/dashboard/lines"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium">Live Odds</h3>
            <p className="text-sm text-gray-600">Track line movements</p>
          </Link>

          <Link 
            href="/chat"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-medium">AI Assistant</h3>
            <p className="text-sm text-gray-600">Get betting insights</p>
          </Link>

          <Link 
            href="/dashboard/projections"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-medium">AI Projections</h3>
            <p className="text-sm text-gray-600">Model predictions</p>
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="text-green-500 mt-1">✓</div>
            <div>
              <h3 className="font-medium">Moneyline & Over/Under Analysis</h3>
              <p className="text-sm text-gray-600">
                Powered by team offensive/defensive metrics, pitcher matchups, and recent form
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="text-green-500 mt-1">✓</div>
            <div>
              <h3 className="font-medium">First 5 Innings (F5) Predictions</h3>
              <p className="text-sm text-gray-600">
                Specialized models for early-game betting opportunities
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="text-green-500 mt-1">✓</div>
            <div>
              <h3 className="font-medium">YRFI/NRFI (First Inning Runs)</h3>
              <p className="text-sm text-gray-600">
                Analysis based on team early-scoring tendencies and pitcher control metrics
              </p>
            </div>
          </div>

          {role === 'vip' && (
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 mt-1">💎</div>
              <div>
                <h3 className="font-medium">Player Props Analysis (VIP)</h3>
                <p className="text-sm text-gray-600">
                  Advanced prop betting insights with individual player modeling
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade CTA for Free Users */}
      {role === 'free' && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Unlock Full Potential</h2>
          <p className="mb-4">
            Upgrade to Pro or VIP for unlimited AI messages, advanced analytics, and exclusive features.
          </p>
          <Link 
            href="/pricing"
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            View Pricing Plans
          </Link>
        </div>
      )}
    </div>
  );
}
