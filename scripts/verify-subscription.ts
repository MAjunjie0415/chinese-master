import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/drizzle';
import { users, userUsage } from '../db/schema/users';
import { eq, sql } from 'drizzle-orm';
import { checkAndIncrementPronunciationQuota, getCustomCourseUsage } from '../lib/subscription';

async function verify() {
    console.log('--- Verifying Subscription System ---');

    // 1. Find a test user
    const [testUser] = await db.select().from(users).limit(1);
    if (!testUser) {
        console.log('No users found in database.');
        return;
    }
    const userId = testUser.id;
    const initialPlan = testUser.plan;
    console.log(`Testing with User ID: ${userId}, Plan: ${initialPlan}`);

    // 2. Test Custom Course Quota
    console.log('\n2. Testing Custom Course Quota:');
    const usage = await getCustomCourseUsage(userId);
    console.log(`Current usage: ${usage.count}/${usage.limit}`);

    // 3. Test Pronunciation Quota
    console.log('\n3. Testing Pronunciation Quota:');
    const result = await checkAndIncrementPronunciationQuota(userId);
    console.log(`Pronunciation check result: ${result.success ? 'Success' : 'Failed'}`);
    if (result.success) {
        console.log(`New count: ${result.usageCount}`);
    } else {
        console.log(`Message: ${result.message}`);
    }

    // 4. Test Pro Plan logic
    console.log('\n4. Testing Pro Plan behavior:');
    // Temporarily set to pro
    await db.update(users).set({ plan: 'pro' }).where(eq(users.id, userId));
    const proUsage = await getCustomCourseUsage(userId);
    console.log(`Pro plan usage limit: ${proUsage.limit}`);

    const proResult = await checkAndIncrementPronunciationQuota(userId);
    console.log(`Pro plan pronunciation check (should be always success): ${proResult.success ? 'Success' : 'Failed'}`);

    // Restore initial plan
    await db.update(users).set({ plan: initialPlan }).where(eq(users.id, userId));

    console.log('\n--- Verification Script Finished ---');
    process.exit(0);
}

verify().catch(console.error);
