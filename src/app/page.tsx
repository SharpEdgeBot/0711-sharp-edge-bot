import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="border-b border-blue-700 bg-blue-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">⚾</span>
            </div>
            <h1 className="text-xl font-bold text-white">MLB Sharp Edge</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {userId ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-white hover:text-blue-200 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-white text-blue-900 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-6">
            AI-Powered MLB Betting Analytics
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Leverage advanced statistical models and machine learning to identify 
            the most predictive features for MLB betting outcomes. Get edge on 
            Moneyline, Over/Under, F5, and YRFI/NRFI markets.
          </p>
          
          {userId ? (
            <Link 
              href="/dashboard"
              className="inline-flex items-center bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-flex items-center bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
                Start Free Trial →
              </button>
            </SignUpButton>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">🎯 Predictive Models</h3>
            <p className="text-blue-100">
              Advanced ML models trained on comprehensive MLB data to identify 
              the highest-edge betting opportunities.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">📊 Real-Time Data</h3>
            <p className="text-blue-100">
              Live odds tracking, game statistics, and pitcher matchup analysis 
              updated continuously throughout the season.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">🤖 AI Assistant</h3>
            <p className="text-blue-100">
              Chat with our AI to get personalized betting insights and 
              analysis for specific games and market conditions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
