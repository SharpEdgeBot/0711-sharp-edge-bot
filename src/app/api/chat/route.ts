import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { getUserRole } from '@/lib/auth';
import { canSendMessage, incrementUsage } from '@/lib/usage';
import { getCachedPregameContext } from '@/lib/cachePregameStats';
import { getUserRateLimit } from '@/utils/rateLimiter';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // const user = await currentUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const user = { id: 'dev-user' };

    const userRole = await getUserRole();
    
    // Check rate limiting
    const rateLimit = await getUserRateLimit(user.id, userRole);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: rateLimit.headers,
        }
      );
    }

    // Check usage limits
    const canSend = await canSendMessage(user.id, userRole);
    if (!canSend) {
      return NextResponse.json(
        { error: 'Daily message limit exceeded. Upgrade your plan for unlimited messages.' },
        { status: 429 }
      );
    }

    const { message, gameId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Inject cached pregame context for the AI
    let gameContext = null;
    let allContexts = [];
    const lowerMsg = (message || '').toLowerCase();
    // Detect if user is asking for best bets, slate, or all games
    const wantsSlate = lowerMsg.includes('best bet') || lowerMsg.includes('slate') || lowerMsg.includes('all games') || lowerMsg.includes('top pick') || lowerMsg.includes('top bets');
    if (gameId) {
      try {
        gameContext = await getCachedPregameContext(gameId);
      } catch (error) {
        console.error('Error fetching cached game context:', error);
        // Continue without game context
      }
    } else if (wantsSlate) {
      // Fetch all cached contexts for today's games
      try {
        // Scan Redis for all pregame:<gamePk> keys
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        let keys = await redis.keys('pregame:*');
        if (keys.length === 0) {
          // If cache is empty, trigger cachePregameStats for today
          const today = new Date().toISOString().slice(0, 10);
          const { cachePregameStats } = await import('@/lib/cachePregameStats');
          const apiKey = process.env.OPTIMAL_BET_API_KEY!;
          const season = new Date().getFullYear();
          await cachePregameStats({ date: today, season, apiKey });
          // Re-scan Redis for new keys
          keys = await redis.keys('pregame:*');
        }
        for (const key of keys) {
          const context = await redis.get(key);
          if (context) {
            if (typeof context === 'string') {
              try {
                allContexts.push(JSON.parse(context));
              } catch (err) {
                console.error('Error parsing cached context:', err);
              }
            } else {
              allContexts.push(context);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching all cached game contexts:', error);
      }
    }

    // Construct the prompt with game context(s)
    let systemPrompt = `You are an expert MLB betting analyst. You provide insights based on statistical analysis and predictive modeling.\n\nKey principles:\n- Focus on data-driven analysis\n- Highlight the most predictive features for each betting market\n- Consider team offensive/defensive metrics, pitcher matchups, and recent form\n- Always mention uncertainty and risk management\n- Never guarantee outcomes\n`;
    if (allContexts.length > 0) {
      systemPrompt += `\nToday's Full Slate Contexts:\n${JSON.stringify(allContexts, null, 2)}\n\nInstructions:\n- Reference actual team names, pitcher names, and stats from the provided slate context.\n- Provide best bets, top picks, and market analysis for the entire slate.\n- Do not use generic placeholders.\n- Use context to give specific insights for moneyline, run line, totals, F5, and YRFI/NRFI markets.\n`;
    } else if (gameContext) {
      systemPrompt += `\nCurrent Game Context:\n${JSON.stringify(gameContext, null, 2)}\n\nInstructions:\n- Reference actual team names, pitcher names, and stats from the provided context.\n- Do not use generic placeholders.\n- Use context to give specific insights for moneyline, run line, totals, F5, and YRFI/NRFI markets.\n`;
    } else {
      systemPrompt += `\nNo game context was provided. Respond with general MLB betting advice and request a specific game or slate for tailored analysis.\n`;
    }
    systemPrompt += `\nProvide actionable insights while emphasizing responsible betting practices.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Increment usage tracking
    await incrementUsage(user.id);

    // Return correct context (allContexts for slate, gameContext for single game)
    let contextForResponse = null;
    if (allContexts.length > 0) {
      contextForResponse = allContexts;
    } else if (gameContext) {
      contextForResponse = gameContext;
    }

    return NextResponse.json({
      response: aiResponse,
      gameContext: contextForResponse,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
