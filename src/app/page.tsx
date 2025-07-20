import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

import ThemeToggle from '@/components/ThemeToggle';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚾</span>
            </div>
            <h1 className="text-xl font-semibold">MLB Sharp Edge</h1>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="modern-btn-ghost"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="modern-btn-ghost">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="modern-btn">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="main-content">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-hero gradient-text mb-6">
              AI-Powered MLB 
              <br />
              Betting Analytics
            </h1>
            <p className="text-body text-lg mb-12 max-w-2xl mx-auto">
              Leverage advanced statistical models and machine learning to identify 
              the most predictive features for MLB betting outcomes. Get edge on 
              Moneyline, Over/Under, F5, and YRFI/NRFI markets.
            </p>
            {userId ? (
              <Link 
                href="/dashboard"
                className="modern-btn text-base px-8 py-3 h-12"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="modern-btn text-base px-8 py-3 h-12">
                  Start Free Trial →
                </button>
              </SignUpButton>
            )}
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid md:grid-cols-3 gap-6">
            <div className="modern-card group">
              <div className="text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">🎯</div>
              <h3 className="text-subheading mb-3">Predictive Models</h3>
              <p className="text-body">
                Advanced ML models trained on comprehensive MLB data to identify 
                the highest-edge betting opportunities.
              </p>
            </div>
            
            <div className="modern-card group">
              <div className="text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">📊</div>
              <h3 className="text-subheading mb-3">Real-Time Data</h3>
              <p className="text-body">
                Live odds tracking, game statistics, and pitcher matchup analysis 
                updated continuously throughout the season.
              </p>
            </div>
            
            <div className="modern-card group">
              <div className="text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">🤖</div>
              <h3 className="text-subheading mb-3">AI Assistant</h3>
              <p className="text-body">
                Chat with our AI to get personalized betting insights and 
                analysis for specific games and market conditions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
