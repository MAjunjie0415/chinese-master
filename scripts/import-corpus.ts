import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import postgres from 'postgres';
import { pipeline } from '@xenova/transformers';

// 1. Load Environment
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 2. Constants
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Missing DATABASE_URL');
    process.exit(1);
}

// 3. PostgreSQL Client
const sql = postgres(DATABASE_URL);

// 4. Local Embedding Utility
let extractor: any = null;

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (!extractor) {
        console.log('  🚀 Initializing local embedding model (all-MiniLM-L6-v2)...');
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    const embeddings: number[][] = [];
    for (const text of texts) {
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        embeddings.push(Array.from(output.data));
    }
    return embeddings;
}

// 5. Main Script
async function importCorpus() {
    console.log('📖 Starting LOCAL corpus import with Transformers.js...');

    // --- HSK Words ---
    console.log('📥 Importing HSK words...');
    const hskPath = path.join(process.cwd(), 'hsk_words_clean.csv');
    if (fs.existsSync(hskPath)) {
        const hskRecords: any[] = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(hskPath)
                .pipe(csv())
                .on('data', (data) => hskRecords.push(data))
                .on('end', resolve)
                .on('error', reject);
        });
        console.log(`  Found ${hskRecords.length} HSK records.`);
        await processBatch(hskRecords, 'HSK');
    }

    // --- Business Words ---
    console.log('📥 Importing Business words...');
    const businessPath = path.join(process.cwd(), 'business_words_clean.csv');
    if (fs.existsSync(businessPath)) {
        const businessRecords: any[] = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(businessPath)
                .pipe(csv())
                .on('data', (data) => businessRecords.push(data))
                .on('end', resolve)
                .on('error', reject);
        });
        console.log(`  Found ${businessRecords.length} Business records.`);
        await processBatch(businessRecords, 'Business');
    }

    console.log('✅ Local Corpus import complete!');
    await sql.end();
}

async function processBatch(records: any[], source: 'HSK' | 'Business') {
    const BATCH_SIZE = 50;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        console.log(`  Processing ${source} batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}...`);

        try {
            const texts = batch.map(r => `${r.汉字} (${r.拼音}): ${r.英文释义}`);
            const embeddings = await generateEmbeddingsBatch(texts);

            for (let j = 0; j < batch.length; j++) {
                const r = batch[j];
                const level = source === 'HSK' ? `HSK${r.等级}` : 'Business';

                await sql`
                    INSERT INTO golden_corpus (
                        chinese, pinyin, english, level, category, scene, example_sentence, embedding, source, verified, created_at, updated_at
                    ) VALUES (
                        ${r.汉字}, 
                        ${r.拼音 || ''}, 
                        ${r.英文释义 || ''}, 
                        ${level}, 
                        ${r.category || r.场景标签 || null}, 
                        ${r.场景标签 || null}, 
                        ${r.例句 || null}, 
                        ${JSON.stringify(embeddings[j])}, 
                        ${source}, 
                        true, 
                        NOW(), 
                        NOW()
                    )
                    ON CONFLICT (chinese) DO NOTHING
                `;
            }
        } catch (error) {
            console.error(`❌ Error at index ${i}:`, error);
        }
    }
}

importCorpus().catch(async (error) => {
    console.error('❌ Global error:', error);
    await sql.end();
    process.exit(1);
});
