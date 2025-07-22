
import { createClient } from '@supabase/supabase-js';
// Or import your Redis client if you use Redis for odds cache
// import { redis } from '@/lib/redis';


export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const resolvedParams = await context.params;
  const { id } = resolvedParams;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing or invalid game id' }), { status: 400 });
  }
  // Example: Read odds from Supabase odds_current table
  // You may need to adjust this for your actual cache source
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase
    .from('odds_current')
    .select('*')
    .eq('game_id', id)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to read cached odds', details: error.message }), { status: 500 });
  }
  if (!data || data.length === 0) {
    return new Response(JSON.stringify({ error: 'No cached odds found for game' }), { status: 404 });
  }
  return new Response(JSON.stringify({ odds: data[0].odds_value }), { status: 200 });
}
