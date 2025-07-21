import { supabase } from './supabase';
import { SubscriptionTier } from '@/types';

const DAILY_LIMITS = {
  free: 3,
  pro: Infinity,
  vip: Infinity,
};

export async function getRemainingMessages(
  userId: string, 
  role: SubscriptionTier
): Promise<number> {
  if (role === 'vip' || role === 'pro') return Infinity;
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('users_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching usage:', error);
    return 0;
  }

  const usedMessages = data?.message_count || 0;
  const limit = DAILY_LIMITS[role];

  return Math.max(0, limit - usedMessages);
}

export async function incrementUsage(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Direct insert/update without RPC function to avoid any SQL issues
    const { error } = await supabase
      .from('users_usage')
      .upsert(
        {
          user_id: userId,
          usage_date: today,
          message_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,usage_date',
          count: 'exact',
        }
      );

    if (error) {
      console.error('Error incrementing usage:', error);
      // Don't throw error, just log it - usage tracking shouldn't break the chat
      console.warn('Usage tracking failed, but continuing with chat...');
    }
  } catch (error) {
    console.error('Usage tracking error:', error);
    // Don't throw error, just log it
  }
}

export async function canSendMessage(
  userId: string, 
  role: SubscriptionTier
): Promise<boolean> {
  const remaining = await getRemainingMessages(userId, role);
  return remaining > 0;
}
