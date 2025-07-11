# MLB Sharp Edge - AI-Powered Betting Analytics

Modern Next.js application for MLB betting predictive analytics using advanced statistical models and machine learning to identify the most predictive features for betting outcomes.

## 🎯 Features

- **AI-Powered Analysis**: Advanced ML models for Moneyline, Over/Under, F5, and YRFI/NRFI markets
- **Real-Time Data**: Live MLB statistics and betting odds integration
- **Subscription Tiers**: Free, Pro, and VIP plans with Stripe billing
- **AI Assistant**: Chat interface with game context injection
- **Predictive Models**: Statistical feature analysis for betting edge discovery

## 🏗️ Architecture

```
Next.js (App Router)
├── Clerk (Auth + RBAC)
├── Stripe (Billing Tiers: Free / Pro / VIP)
├── Supabase (Usage tracking, game snapshots, odds, props)
├── MLB Open API (Stats, matchups, teams, players)
├── OptimalBets API (Odds, lines, props)
├── Redis (Upstash, for caching and rate limiting)
├── OpenAI (AI assistant context injection + response)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended for built-in fetch and test runner)
- npm/yarn/pnpm/bun
- Environment variables (see `.env.example`)

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Fill in your API keys and configuration
```

3. **Required API Keys:**
- Clerk (Authentication)
- Stripe (Billing)
- Supabase (Database)
- Upstash Redis (Caching)
- OpenAI (AI Assistant)
- OptimalBets API (Betting odds)

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Data Sources & Integration

### MLB Open API
- **Rate Limit**: 5-10 requests/sec
- **Authentication**: None required
- **Endpoints**: Schedule, game data, player/team stats
- **Base URL**: `https://statsapi.mlb.com/api/v1`

### OptimalBets API  
- **Rate Limit**: 60 requests/min
- **Authentication**: Bearer token
- **Endpoints**: Events, markets, odds, player props
- **Markets**: Moneyline, totals, F5, YRFI/NRFI

## 🧪 API Testing Best Practices

- Add a test script to your `package.json`:
  ```json
  "scripts": {
    "test": "jest"
  }
  ```
- Use Jest for integration tests (`npm test`).
- Log full API responses in your tests for inspection:
  ```js
  console.log('MLB API Response:', JSON.stringify(data, null, 2));
  ```
- Use TypeScript interfaces for expected response shapes.
- Keep dependencies up to date (`jest`, `node-fetch`).
- Prefer built-in `fetch` and Node.js test runner for new projects (Node 18+).

## 🧠 Predictive Features

### Top Features by Market

**Moneyline (Win/Loss)**:
- Team runsAllowedPerGame (ρ=-0.45)
- Pitcher FIP (ρ=-0.42)
- Team OPS (ρ=+0.38)

**Over/Under Totals**:
- Team runsPerGame (ρ=+0.72)
- Batting wOBA (ρ=+0.68)
- Team runsAllowedPerGame (ρ=+0.65)

**YRFI/NRFI (First Inning)**:
- Team 1st-inning runs per game (ρ=+0.35)
- Home team OBP (ρ=+0.28)
- Starting pitcher ERA (ρ=-0.22)

## 🏃‍♂️ Project Structure

```
/src
  /app
    /chat                  ← Chat UI with usage limit enforcement
    /dashboard
      /games               ← Overview of upcoming games
      /lines               ← Odds comparison
      /props               ← Player prop odds (VIP only)
      /projections         ← AI betting projections
    /account               ← Clerk + Stripe billing mgmt
    /pricing               ← Tier comparison page
  /api
    /chat/route.ts         ← Usage enforcement + AI response handler
    /data/mlb.ts           ← MLB Open API wrapper
    /data/optimal.ts       ← OptimalBets odds/props fetcher
    /stripe/webhook.ts     ← Subscription -> Clerk metadata sync
  /lib
    supabase.ts            ← Supabase client
    auth.ts                ← Clerk role fetch + middleware logic
    usage.ts               ← Track daily chat message counts
    mlbApi.ts              ← Game context builder (JSON format)
    optimalApi.ts          ← Odds and props fetchers
  /utils
    buildGameContext.ts    ← Full game JSON builder
    rateLimiter.ts         ← Redis usage limiter
```

## 💳 Subscription Tiers

- **Free**: 3 AI messages/day, basic analytics
- **Pro**: Unlimited messages, advanced analytics
- **VIP**: Everything + player props analysis

## 🔧 Development

### Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run API and integration tests
```

### Environment Setup

Required environment variables in `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# OpenAI
OPENAI_API_KEY=

# OptimalBets API
OPTIMAL_BETS_API_KEY=
```

## 📈 Performance Features

- **Caching Strategy**: Redis for game contexts (10min TTL), odds (5min TTL)
- **Rate Limiting**: Per-user limits based on subscription tier
- **Error Handling**: Exponential backoff for API failures
- **Data Alignment**: Robust mapping between MLB and betting APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@mlbsharpedge.com or join our Discord community.
