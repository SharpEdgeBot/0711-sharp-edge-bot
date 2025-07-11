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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    if (gameId) {
      try {
        gameContext = await getCachedPregameContext(gameId);
      } catch (error) {
        console.error('Error fetching cached game context:', error);
        // Continue without game context
      }
    }

    // Construct the prompt with game context
    const systemPrompt = `You are an expert MLB betting analyst. You provide insights based on statistical analysis and predictive modeling.

Key principles:
- Focus on data-driven analysis
- Highlight the most predictive features for each betting market
- Consider team offensive/defensive metrics, pitcher matchups, and recent form
- Always mention uncertainty and risk management
- Never guarantee outcomes

${gameContext ? `

Current Game Context:
${JSON.stringify(gameContext, null, 2)}

Use this data to provide specific insights about:
- Moneyline predictions based on team metrics and pitcher matchups
- Over/Under analysis using offensive production and pitching strength
- F5 (First 5 innings) opportunities
- YRFI/NRFI (First inning runs) based on early-inning tendencies

` : ''}

Provide actionable insights while emphasizing responsible betting practices.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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

    return NextResponse.json({
      response: aiResponse,
      gameContext: gameContext || null,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
