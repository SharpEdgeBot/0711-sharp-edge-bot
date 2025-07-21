// All server-only code removed. Only client-safe code remains here.
export async function getUserRoleClient(): Promise<string> {
  if (typeof window === 'undefined') return 'free';
  try {
    // @ts-expect-error: Clerk types are not available in this context (server-only import)
    const user = window.Clerk?.user || null;
    return (user?.publicMetadata?.subscriptionTier as string) || 'free';
  } catch {
    return 'free';
  }
}
