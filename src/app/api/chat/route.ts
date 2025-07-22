import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { getUserRole } from '@/lib/auth.server';
import { canSendMessage, incrementUsage } from '@/lib/usage';
import { getCachedPregameContext } from '@/lib/cachePregameStats';
import { getUserRateLimit } from '@/utils/rateLimiter';

export const POST = async (request: NextRequest) => {
    const user = { id: 'dev-user' };
    const userRole = await getUserRole();
    const rateLimit = await getUserRateLimit(user.id, userRole);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ content: 'Error: Rate limit exceeded.' }), { status: 429 });
    }
    const canSend = await canSendMessage(user.id, userRole);
    if (!canSend) {
      return new Response(JSON.stringify({ content: 'Error: Daily message limit exceeded. Upgrade your plan for unlimited messages.' }), { status: 429 });
    }
    const body = await request.json();
  let message = body.message;
  const gameId = body.gameId;
    if (!message && body.content && body.role === 'user') {
      message = body.content;
    }
    if (!message) {
      return new Response(JSON.stringify({ content: 'Error: Message is required.' }), { status: 400 });
    }
  let gameContext = null;
  let allContexts = [];
    const lowerMsg = (message || '').toLowerCase();
    const wantsSlate = lowerMsg.includes('best bet') || lowerMsg.includes('slate') || lowerMsg.includes('all games') || lowerMsg.includes('top pick') || lowerMsg.includes('top bets');
    if (gameId) {
      try {
        gameContext = await getCachedPregameContext(gameId);
      } catch {
        gameContext = null;
      }
    } else if (wantsSlate) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        let keys = await redis.keys('pregame:*');
        if (keys.length === 0) {
          const today = new Date().toISOString().slice(0, 10);
          const { cachePregameStats } = await import('@/lib/cachePregameStats');
          await cachePregameStats({ date: today });
          keys = await redis.keys('pregame:*');
        }
        for (const key of keys) {
          const context = await redis.get(key);
          if (context) {
            if (typeof context === 'string') {
              try {
                allContexts.push(JSON.parse(context));
              } catch {}
            } else if (typeof context === 'object' && context !== null) {
              allContexts.push(context);
            }
          }
        }
      } catch {
        allContexts = [];
      }
    }
    let systemPrompt = `You are an expert MLB betting analyst. You provide insights based on statistical analysis and predictive modeling.\n\nKey principles:\n- Focus on data-driven analysis\n- Highlight the most predictive features for each betting market\n- Consider team offensive/defensive metrics, pitcher matchups, and recent form\n- Always mention uncertainty and risk management\n- Never guarantee outcomes\n`;
    if (allContexts.length > 0) {
      systemPrompt += `\nToday's Full Slate Contexts:\n${JSON.stringify(allContexts, null, 2)}\n\nInstructions:\n- Reference actual team names, pitcher names, and stats from the provided slate context.\n- Provide best bets, top picks, and market analysis for the entire slate.\n- Do not use generic placeholders.\n- Use context to give specific insights for moneyline, run line, totals, F5, and YRFI/NRFI markets.\n`;
    } else if (gameContext) {
      systemPrompt += `\nCurrent Game Context:\n${JSON.stringify(gameContext, null, 2)}\n\nInstructions:\n- Reference actual team names, pitcher names, and stats from the provided context.\n- Do not use generic placeholders.\n- Use context to give specific insights for moneyline, run line, totals, F5, and YRFI/NRFI markets.\n`;
    } else {
      systemPrompt += `\nNo game context was provided. Respond with general MLB betting advice and request a specific game or slate for tailored analysis.\n`;
    }
    try {
      // Use ai-sdk generateText function
      const result = await generateText({
        model: openai('gpt-4o-mini'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        maxTokens: 2000,
        temperature: 0.25,
      });
      
      const content = result.text || '';
      await incrementUsage(user.id);
      return new Response(JSON.stringify({ content }), { status: 200 });
    } catch (error) {
      console.error('Chat API backend error:', error);
      return new Response(JSON.stringify({ content: 'Error: ' + ((error as Error)?.message || 'Unknown error') }), { status: 500 });
    }
}


