import { NextRequest, NextResponse } from 'next/server';
import { db, client } from '@/lib/drizzle';
import { sql } from 'drizzle-orm';
import { pipeline } from '@xenova/transformers';

let embedder: any = null;

async function getEmbedder() {
    if (!embedder) {
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return embedder;
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const generateEmbedding = await getEmbedder();
        const output = await generateEmbedding(query, {
            pooling: 'mean',
            normalize: true,
        });

        const embedding = Array.from(output.data as Float32Array);
        const vectorString = JSON.stringify(embedding);

        // Vector search using raw postgres client to bypass Drizzle issues
        // We use unsafe/raw query construction for the vector literal which proved to work in diagnose-db.ts
        const results = await client.unsafe(`
            SELECT 
                chinese, 
                pinyin, 
                english, 
                example_sentence, 
                1 - (embedding <=> $1::vector) as similarity
            FROM golden_corpus
            ORDER BY similarity DESC
            LIMIT 10
        `, [vectorString]);

        // Postgres.js returns an array-like object, map it to plain array
        const plainResults = Array.from(results);

        return NextResponse.json({ results: plainResults });
    } catch (error: any) {
        // Detailed error logging for debugging pgvector issues
        console.error('SEARCH API ERROR DETAILS:', {
            message: error.message,
            code: error.code,
            hint: error.hint,
            position: error.position,
            routine: error.routine,
            stack: error.stack
        });

        return NextResponse.json(
            { error: `Search query failed: ${error.message} (Code: ${error.code})` },
            { status: 500 }
        );
    }
}
