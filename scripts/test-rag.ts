import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';
import { pipeline } from '@xenova/transformers';

// 1. Load Environment
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ Missing DATABASE_URL');
    process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function testSearch(queryText: string) {
    console.log(`🔍 Testing search for: "${queryText}"`);

    // 1. Generate query embedding
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = await extractor(queryText, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    // 2. Search database
    const results = await sql`
        SELECT 
            chinese, 
            pinyin, 
            english, 
            level,
            1 - (embedding <=> ${JSON.stringify(embedding)}::vector) as similarity
        FROM golden_corpus
        ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
        LIMIT 5
    `;

    console.log('✅ Top Results:');
    results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.chinese} (${r.pinyin}): ${r.english} [Level: ${r.level}, Similarity: ${Number(r.similarity).toFixed(4)}]`);
    });
}

const query = process.argv[2] || 'apple';
testSearch(query)
    .then(() => sql.end())
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
