import { config } from 'dotenv';
config({ path: '.env.local' });
import { db, client } from '@/lib/drizzle';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('🔍 Diagnosing DB Connection and Vector Extension...');

    try {
        // 1. Check connection
        const [{ current_database }] = await db.execute(sql`SELECT current_database()`);
        console.log('✅ Connected to DB:', current_database);

        // 2. Check extensions
        const extensions = await db.execute(sql`SELECT * FROM pg_extension WHERE extname = 'vector'`);
        console.log('📦 Vector Extension:', extensions.length > 0 ? 'Installed' : 'MISSING');

        // 3. Check table schema
        const columns = await db.execute(sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'golden_corpus' AND column_name = 'embedding'
    `);
        console.log('📊 Embedding Column:', columns[0]);

        // 4. Try simple vector query using Drizzle
        console.log('🧪 Testing Vector Query via Drizzle...');
        const vector = Array(384).fill(0.1);
        const vectorStr = JSON.stringify(vector);

        try {
            // Use the exact same syntax as the failing route
            const result = await db.execute(sql`
            SELECT 1 - (embedding <=> ${sql.raw(`'${vectorStr}'::vector`)}) as similarity
            FROM golden_corpus 
            LIMIT 1
        `);
            console.log('✅ Vector Query Success:', result.length > 0 ? 'Got result' : 'No rows');
        } catch (e: any) {
            console.error('❌ Vector Query Failed:', e.message);
        }

    } catch (err) {
        console.error('❌ General Error:', err);
    } finally {
        process.exit(0);
    }
}

main();
