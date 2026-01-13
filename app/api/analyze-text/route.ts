import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/drizzle';
import { words } from '@/db/schema/words';
import { userProgress } from '@/db/schema/progress';
import { eq, and, inArray, gte } from 'drizzle-orm';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

interface ExtractedWord {
    chinese: string;
    pinyin: string;
    english: string;
    hskLevel?: number;
    frequency: number;
}

// Use AI to extract words from text
async function extractWordsWithAI(text: string): Promise<string[]> {
    if (!DASHSCOPE_API_KEY) {
        throw new Error('DASHSCOPE_API_KEY is not set');
    }

    const prompt = `You are a Chinese language expert. Extract all unique Chinese words/phrases from the following text that would be useful for a language learner.

Rules:
1. Return ONLY Chinese words, one per line
2. Include 2-4 character words (avoid single characters unless they are standalone words)
3. Include common phrases and business terms
4. Do not include punctuation or numbers
5. Maximum 30 words

Text:
${text.slice(0, 2000)}

Chinese words (one per line):`;

    try {
        const response = await fetch(
            'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'qwen-turbo',
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 500,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`DashScope API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        // Parse words from response
        const extractedWords = content
            .split('\n')
            .map((line: string) => line.trim())
            .filter((word: string) => word && /^[\u4e00-\u9fff]+$/.test(word));

        return extractedWords;
    } catch (error) {
        console.error('AI extraction error:', error);
        return [];
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Parse request body
        let body;
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            body = await request.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            body = { text: formData.get('text') };
        } else {
            body = await request.json();
        }

        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        if (text.length < 50) {
            return NextResponse.json(
                { error: 'Text must be at least 50 characters' },
                { status: 400 }
            );
        }

        if (text.length > 10000) {
            return NextResponse.json(
                { error: 'Text must be less than 10,000 characters' },
                { status: 400 }
            );
        }

        // Step 1: Extract words using AI
        const extractedWords = await extractWordsWithAI(text);

        if (extractedWords.length === 0) {
            return NextResponse.json(
                { error: 'No Chinese words found in text' },
                { status: 400 }
            );
        }

        // Step 2: Match with our word database
        const matchedWords = await db
            .select({
                id: words.id,
                chinese: words.chinese,
                pinyin: words.pinyin,
                english: words.english,
            })
            .from(words)
            .where(inArray(words.chinese, extractedWords));

        // Step 3: Get user's mastered words
        const masteredWordIds = await db
            .select({ wordId: userProgress.wordId })
            .from(userProgress)
            .where(
                and(
                    eq(userProgress.userId, userId),
                    gte(userProgress.masteryScore, 80)
                )
            );

        const masteredSet = new Set(masteredWordIds.map(w => w.wordId));

        // Step 4: Filter out mastered words
        const newWords: ExtractedWord[] = matchedWords
            .filter(word => !masteredSet.has(word.id))
            .map(word => ({
                id: word.id,
                chinese: word.chinese,
                pinyin: word.pinyin,
                english: word.english,
                frequency: extractedWords.filter(w => w === word.chinese).length,
            }))
            .sort((a, b) => b.frequency - a.frequency);

        // Step 5: Generate suggested course title
        const suggestedTitle = `Custom Course - ${new Date().toLocaleDateString()}`;

        return NextResponse.json({
            success: true,
            totalWordsInText: text.length,
            extractedCount: extractedWords.length,
            matchedCount: matchedWords.length,
            newWordsCount: newWords.length,
            newWords: newWords.slice(0, 30), // Limit to 30 words
            suggestedCourseTitle: suggestedTitle,
        });

    } catch (error) {
        const err = error as Error;
        console.error('Error analyzing text:', err.message, err.stack);
        return NextResponse.json(
            { error: 'Internal server error', details: err.message },
            { status: 500 }
        );
    }
}
