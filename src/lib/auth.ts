import { currentUser } from '@clerk/nextjs/server';
import { SubscriptionTier } from '@/types';

export async function getUserRole(): Promise<SubscriptionTier> {
  try {
    const user = await currentUser();
    return (user?.publicMetadata?.subscriptionTier as SubscriptionTier) || 'free';
  } catch (err) {
    return 'free';
  }
}

export async function getUserId(): Promise<string | null> {
  const user = await currentUser();
  return user?.id || null;
}

export function hasAccess(userRole: SubscriptionTier, requiredRole: SubscriptionTier): boolean {
  const roleHierarchy = {
    free: 0,
    pro: 1,
    vip: 2,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
