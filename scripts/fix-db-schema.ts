
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log('🛠️ Fixing DB Schema...');

    // Dynamic import to use optimized pool config
    const { db, client } = await import('@/lib/drizzle');
    const { sql } = await import('drizzle-orm');

    try {
        console.log('1. Dropping all Foreign Keys on user_progress...');

        await db.execute(sql`
            DO $$
            DECLARE r record;
            BEGIN
                FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'user_progress' AND constraint_type = 'FOREIGN KEY'
                LOOP
                    EXECUTE 'ALTER TABLE user_progress DROP CONSTRAINT ' || quote_ident(r.constraint_name);
                    RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
                END LOOP;
            END $$;
        `);

        console.log('2. Re-adding correct Foreign Keys...');

        // Re-add FK to users
        await db.execute(sql`
            ALTER TABLE "user_progress" 
            ADD CONSTRAINT "user_progress_user_id_users_id_fk" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
        `);
        console.log('✅ Added FK to users');

        // Re-add FK to words
        await db.execute(sql`
            ALTER TABLE "user_progress" 
            ADD CONSTRAINT "user_progress_word_id_words_id_fk" 
            FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE cascade ON UPDATE no action;
        `);
        console.log('✅ Added FK to words (FIXED)');

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
    } finally {
        await client.end();
    }
}

main();
