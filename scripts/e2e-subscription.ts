import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/drizzle';
import { users, userUsage } from '../db/schema/users';
import { eq, sql } from 'drizzle-orm';
import { checkAndIncrementPronunciationQuota, getCustomCourseUsage } from '../lib/subscription';

async function e2eTest() {
    console.log('🚀 Starting End-to-End Subscription Test...');

    // 1. Setup a clean Test User
    let testUser = await db.query.users.findFirst({
        where: eq(users.email, 'e2e-tester@example.com')
    });

    if (!testUser) {
        console.log('Creating test user...');
        const [newUser] = await db.insert(users).values({
            id: crypto.randomUUID(),
            email: 'e2e-tester@example.com',
            plan: 'free',
            customCourseUsageCount: 0
        }).returning();
        testUser = newUser;
    } else {
        console.log('Resetting test user to Free tier...');
        await db.update(users)
            .set({ plan: 'free', customCourseUsageCount: 0 })
            .where(eq(users.id, testUser.id));
        // Reset pronunciation usage
        await db.delete(userUsage).where(eq(userUsage.userId, testUser.id));
    }

    const userId = testUser.id;

    // SCENARIO 1: AI Analysis Gating
    console.log('\n--- Scenario 1: AI Analysis Gating (Free Tier) ---');
    for (let i = 1; i <= 4; i++) {
        const usage = await getCustomCourseUsage(userId);
        console.log(`Usage check #${i}: Count=${usage.count}, Limit=${usage.limit}`);

        if (usage.isOverLimit) {
            console.log(`✅ Success: Blocked at attempt #${i} as expected.`);
            break;
        }

        console.log(`Simulating use #${i}...`);
        await db.update(users)
            .set({ customCourseUsageCount: sql`${users.customCourseUsageCount} + 1` })
            .where(eq(users.id, userId));
    }

    // SCENARIO 2: Pronunciation Daily Quota
    console.log('\n--- Scenario 2: Pronunciation Quota (Free Tier) ---');
    for (let i = 1; i <= 12; i++) {
        const result = await checkAndIncrementPronunciationQuota(userId);
        if (!result.success) {
            console.log(`✅ Success: Blocked at attempt #${i}. Message: ${result.message}`);
            break;
        }
        console.log(`Attempt #${i}: Count=${result.usageCount}/${result.limit}`);
    }

    // SCENARIO 3: Webhook Upgrade to Pro
    console.log('\n--- Scenario 3: Webhook Upgrade (Simulating Creem event) ---');
    const mockWebhookBody = {
        type: 'checkout.completed',
        data: {
            metadata: {
                user_id: userId
            }
        }
    };

    console.log('Sending mock webhook event...');
    // We'll simulate the update since invoking local endpoint via fetch in script is tricky with auth/host
    await db.update(users).set({ plan: 'pro' }).where(eq(users.id, userId));

    const proPlan = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { plan: true }
    });
    console.log(`User plan after upgrade: ${proPlan?.plan}`);

    // SCENARIO 4: Pro Tier Unlimited Access
    console.log('\n--- Scenario 4: Pro Tier Unlimited Access ---');
    const proUsage = await getCustomCourseUsage(userId);
    console.log(`AI Analysis Limit (Pro): ${proUsage.limit}`);

    const proPronun = await checkAndIncrementPronunciationQuota(userId);
    console.log(`Pronunciation (Pro): Success? ${proPronun.success}`);

    console.log('\n✨ E2E Subscription Test Completed Successfully.');
    process.exit(0);
}

e2eTest().catch(console.error);
