/**
 * 批量修复单词英文翻译
 * 使用 DashScope Qwen API 为缺失英文翻译的单词生成翻译
 */

import 'dotenv/config';
import { db, client } from '../lib/drizzle';
import { words } from '../db/schema/words';
import { eq, sql } from 'drizzle-orm';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const BATCH_SIZE = 20; // 每批处理的单词数
const DELAY_MS = 1000; // 每批之间的延迟，避免 API 限流

interface WordToFix {
    id: number;
    chinese: string;
    pinyin: string;
    english: string;
}

async function translateWithQwen(words: WordToFix[]): Promise<Map<number, string>> {
    if (!DASHSCOPE_API_KEY) {
        throw new Error('DASHSCOPE_API_KEY is not set');
    }

    // 构建批量翻译 prompt
    const wordList = words.map((w, i) => `${i + 1}. ${w.chinese} (${w.pinyin})`).join('\n');

    const prompt = `You are a Chinese-English dictionary. Translate the following Chinese words to English. 
Return ONLY the translations in the exact same order, one per line, numbered.
Keep translations concise (1-4 words). For phrases, give the most common meaning.

Chinese words:
${wordList}

English translations (numbered, one per line):`;

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
                        { role: 'system', content: 'You are a professional Chinese-English translator. Provide accurate, concise translations.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 1000,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`DashScope API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        // 解析返回的翻译
        const translations = new Map<number, string>();
        const lines = content.split('\n').filter((line: string) => line.trim());

        for (const line of lines) {
            // 匹配格式如 "1. company" 或 "1: company"
            const match = line.match(/^(\d+)[.:\s]+(.+)$/);
            if (match) {
                const index = parseInt(match[1], 10) - 1;
                const translation = match[2].trim();
                if (index >= 0 && index < words.length && translation) {
                    translations.set(words[index].id, translation);
                }
            }
        }

        return translations;
    } catch (error) {
        console.error('Translation error:', error);
        return new Map();
    }
}

async function fixWordTranslations() {
    console.log('🔧 Starting batch translation fix...\n');

    // 1. 获取所有需要修复的单词 (english 字段包含中文字符)
    const badWords = await client<WordToFix[]>`
    SELECT id, chinese, pinyin, english 
    FROM words 
    WHERE english ~ '[\\u4e00-\\u9fff]'
    ORDER BY id
  `;

    console.log(`📊 Found ${badWords.length} words to fix\n`);

    if (badWords.length === 0) {
        console.log('✅ No words to fix!');
        await client.end();
        return;
    }

    let fixedCount = 0;
    let failedCount = 0;

    // 2. 分批处理
    for (let i = 0; i < badWords.length; i += BATCH_SIZE) {
        const batch = badWords.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(badWords.length / BATCH_SIZE);

        console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} words)...`);

        try {
            const translations = await translateWithQwen(batch);

            // 3. 更新数据库
            for (const word of batch) {
                const newEnglish = translations.get(word.id);
                if (newEnglish && !/[\u4e00-\u9fff]/.test(newEnglish)) {
                    await db.update(words)
                        .set({ english: newEnglish })
                        .where(eq(words.id, word.id));
                    console.log(`  ✓ ${word.chinese} → ${newEnglish}`);
                    fixedCount++;
                } else {
                    console.log(`  ✗ ${word.chinese} - failed to get valid translation`);
                    failedCount++;
                }
            }
        } catch (error) {
            console.error(`  ❌ Batch ${batchNum} failed:`, error);
            failedCount += batch.length;
        }

        // 延迟以避免 API 限流
        if (i + BATCH_SIZE < badWords.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }

        // 每 10 批显示进度
        if (batchNum % 10 === 0) {
            console.log(`\n📈 Progress: ${Math.round((i + batch.length) / badWords.length * 100)}%\n`);
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`\n🎉 Translation fix complete!`);
    console.log(`   ✓ Fixed: ${fixedCount} words`);
    console.log(`   ✗ Failed: ${failedCount} words`);

    await client.end();
}

fixWordTranslations().catch(console.error);
