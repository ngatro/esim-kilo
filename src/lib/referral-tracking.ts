import { cookies } from 'next/headers';
import { REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_DAYS } from '@/lib/affiliate';

// Set referral cookie (async)
export async function setReferralCookie(referralCode: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFERRAL_COOKIE_NAME, referralCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFERRAL_COOKIE_DAYS * 24 * 60 * 60, // 30 days in seconds
    path: '/',
  });
}

// Get referral code from cookie or URL query param (async)
export async function getReferralCode(): Promise<string | null> {
  // Check cookie first
  const cookieStore = await cookies();
  const cookieRef = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
  
  return cookieRef || null;
}

// Get referral code from URL only (for client components)
export function getReferralCodeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch {
    return null;
  }
}