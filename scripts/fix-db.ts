import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import postgres from 'postgres';

async function fix() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL not set');

    const sql = postgres(databaseUrl);

    try {
        console.log('Adding columns to users table...');
        await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'free' NOT NULL`;
        await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custom_course_usage_count" integer DEFAULT 0 NOT NULL`;
        console.log('✅ Columns added successfully.');
    } catch (error) {
        console.error('❌ Error fixing database:', error);
    } finally {
        await sql.end();
    }
}

fix();
