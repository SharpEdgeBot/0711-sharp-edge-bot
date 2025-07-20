// src/lib/quotaMonitor.ts
import { supabase } from './supabase';

export async function getApiQuotaStatus() {
  const { data, error } = await supabase
    .from('api_usage')
    .select('calls_made, calls_remaining, date')
    .order('date', { ascending: false })
    .limit(1);
  if (error) throw error;
  if (!data || !data.length) return { status: 'unknown', calls_made: 0, calls_remaining: 500 };
  const { calls_made, calls_remaining } = data[0];
  let status = 'ok';
  if (calls_made >= 400) status = 'warning'; // 80%
  if (calls_made >= 475) status = 'critical'; // 95%
  if (calls_remaining <= 0) status = 'exhausted';
  return { status, calls_made, calls_remaining };
}

export function quotaAlert(status: string) {
  if (status === 'warning') {
    // Show alert or send notification for 80% usage
    alert('API usage at 80% of monthly quota. Please monitor usage.');
  } else if (status === 'critical') {
    alert('API usage at 95% of monthly quota. Emergency fallback will be used soon.');
  } else if (status === 'exhausted') {
    alert('API quota exhausted. Fallback to cached/static data.');
  }
}
