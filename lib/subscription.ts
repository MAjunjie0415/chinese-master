import { db } from './drizzle';
import { users, userUsage } from '@/db/schema/users';
import { eq, and, sql } from 'drizzle-orm';

export type Plan = 'free' | 'pro' | 'enterprise';

/**
 * Get user's current subscription plan
 */
export async function getUserPlan(userId: string): Promise<Plan> {
    const [user] = await db
        .select({ plan: users.plan })
        .from(users)
        .where(eq(users.id, userId));
    return (user?.plan as Plan) || 'free';
}

/**
 * Check and increment daily pronunciation quota for free users
 */
export async function checkAndIncrementPronunciationQuota(userId: string): Promise<{
    success: boolean;
    usageCount?: number;
    limit?: number;
    message?: string;
}> {
    const plan = await getUserPlan(userId);

    // Pro and Enterprise users have unlimited pronunciation
    if (plan === 'pro' || plan === 'enterprise') {
        return { success: true };
    }

    const today = new Date().toISOString().split('T')[0];

    // Check current usage
    const [usage] = await db
        .select({ count: userUsage.pronunciationCount })
        .from(userUsage)
        .where(
            and(
                eq(userUsage.userId, userId),
                eq(sql`CAST(${userUsage.usageDate} AS DATE)`, today)
            )
        );

    const currentCount = usage?.count || 0;
    const limit = 10;

    if (currentCount >= limit) {
        return {
            success: false,
            usageCount: currentCount,
            limit,
            message: 'Daily pronunciation limit reached. Upgrade to Pro for unlimited audio.'
        };
    }

    // Increment usage
    // Using upsert logic to handle first usage of the day
    await db
        .insert(userUsage)
        .values({
            userId,
            usageDate: today,
            pronunciationCount: 1,
        })
        .onConflictDoUpdate({
            target: [userUsage.userId, userUsage.usageDate],
            set: { pronunciationCount: sql`${userUsage.pronunciationCount} + 1` },
        });

    return { success: true, usageCount: currentCount + 1, limit };
}

/**
 * Check if user can generate a custom course (3-use limit for free)
 */
export async function getCustomCourseUsage(userId: string): Promise<{
    count: number;
    limit: number;
    isOverLimit: boolean;
}> {
    const [user] = await db
        .select({
            plan: users.plan,
            count: users.customCourseUsageCount
        })
        .from(users)
        .where(eq(users.id, userId));

    const plan = user?.plan || 'free';
    const count = user?.count || 0;
    const limit = (plan === 'pro' || plan === 'enterprise') ? Infinity : 3;

    return {
        count,
        limit,
        isOverLimit: count >= limit
    };
}
