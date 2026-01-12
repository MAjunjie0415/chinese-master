import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from '../lib/drizzle';
import { sql } from 'drizzle-orm';

async function checkCorpus() {
    try {
        const result = await db.execute(sql`SELECT count(*) FROM golden_corpus`);
        // In postgres-js driver with drizzle.execute, the response structure can vary.
        // Let's log the whole thing if it's not what we expect.
        const row = (result as any)[0] || (result as any).rows?.[0];
        console.log('📊 Current count in golden_corpus:', row?.count || row?.count_1 || 'unknown');

        const preview = await db.execute(sql`SELECT chinese, pinyin, level FROM golden_corpus LIMIT 5`);
        console.log('📝 Preview data:', (preview as any).rows || preview);
    } catch (error: any) {
        console.error('❌ Error checking corpus:', error.message);
    }
    process.exit(0);
}

checkCorpus();
