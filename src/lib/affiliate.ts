import { prisma } from './prisma';

// Commission rates by Rank
export const COMMISSION_RATES: Record<string, number> = {
  bronze: 0.05,   // 5%
  silver: 0.08,   // 8%
  gold: 0.12,     // 12%
  diamond: 0.15,  // 15%
};

export const RANK_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',
};

// Cookie name for referral tracking
export const REFERRAL_COOKIE_NAME = 'simpal_ref';
export const REFERRAL_COOKIE_DAYS = 30;

// Generate unique affiliate code for a user
export async function generateAffiliateCode(userId: number): Promise<string> {
  const prefix = 'REF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${prefix}${userId}${timestamp}${random}`;
  
  // Ensure uniqueness
  const existing = await prisma.user.findUnique({
    where: { affiliateCode: code },
  });
  
  if (existing) {
    return generateAffiliateCode(userId);
  }
  
  return code;
}

// Get commission rate by rank
export function getCommissionRate(rank: string): number {
  return COMMISSION_RATES[rank.toLowerCase()] || COMMISSION_RATES.bronze;
}

// Calculate commission amount
export function calculateCommission(orderAmount: number, rank: string): number {
  const rate = getCommissionRate(rank);
  return Number((orderAmount * rate).toFixed(2));
}

// Create commission record after successful order
export async function createCommission(
  referrerId: number,
  buyerId: number,
  orderId: number,
  orderNo: string,
  orderAmount: number
): Promise<void> {
  // Get referrer's current rank
  const referrer = await prisma.user.findUnique({
    where: { id: referrerId },
    select: { rank: true },
  });
  
  if (!referrer) return;
  
  const rank = referrer.rank || 'bronze';
  const percentage = getCommissionRate(rank);
  const amount = calculateCommission(orderAmount, rank);
  
  // Create commission record
  await prisma.commission.create({
    data: {
      referrerId,
      buyerId,
      orderId,
      orderNo,
      amount,
      percentage,
      rank,
      status: 'pending',
    },
  });
  
  // Update referrer's affiliate balance
  await prisma.user.update({
    where: { id: referrerId },
    data: {
      affiliateBalance: {
        increment: amount,
      },
    },
  });
}

// Process referral from cookie or query param
export async function processReferral(referralCode: string | null): Promise<number | null> {
  if (!referralCode) return null;
  
  // Find user by affiliate code
  const referrer = await prisma.user.findUnique({
    where: { affiliateCode: referralCode },
    select: { id: true },
  });
  
  return referrer?.id || null;
}

// Get affiliate stats for a user
export async function getAffiliateStats(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      affiliateCode: true,
      affiliateBalance: true,
      rank: true,
      referredById: true,
    },
  });
  
  if (!user) return null;
  
  // Get referral count
  const referralCount = await prisma.user.count({
    where: { referredById: userId },
  });
  
  // Get successful orders from referrals
  const commissions = await prisma.commission.findMany({
    where: { referrerId: userId },
    select: { status: true, amount: true },
  });
  
  const successfulOrders = commissions.filter(c => c.status === 'paid' || c.status === 'approved').length;
  const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
  
  return {
    affiliateCode: user.affiliateCode,
    balance: user.affiliateBalance,
    rank: user.rank,
    referralCount,
    successfulOrders,
    totalEarned,
  };
}

// Update user rank based on performance (can be called manually or via cron)
export async function updateUserRank(userId: number): Promise<string> {
  // Get all commissions for this user
  const commissions = await prisma.commission.findMany({
    where: { referrerId: userId, status: { in: ['approved', 'paid'] } },
    select: { amount: true },
  });
  
  const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);
  
  // Determine new rank based on total earnings
  let newRank = 'bronze';
  if (totalEarnings >= 500) newRank = 'diamond';
  else if (totalEarnings >= 200) newRank = 'gold';
  else if (totalEarnings >= 50) newRank = 'silver';
  
  await prisma.user.update({
    where: { id: userId },
    data: { rank: newRank },
  });
  
  return newRank;
}