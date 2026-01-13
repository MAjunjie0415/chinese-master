import 'dotenv/config';
import { db, client } from '../lib/drizzle';
import { words } from '../db/schema/words';

async function checkWordsData() {
    try {
        console.log('🔍 Checking words table data quality...\n');

        const result = await db.select({
            id: words.id,
            chinese: words.chinese,
            english: words.english,
        }).from(words).limit(20);

        let issueCount = 0;

        console.log('Sample words data:');
        console.log('─'.repeat(60));

        result.forEach(w => {
            // Check if english field contains Chinese characters
            const hasChinese = /[\u4e00-\u9fff]/.test(w.english);
            if (hasChinese) {
                issueCount++;
                console.log(`⚠️  ID: ${w.id}`);
                console.log(`   Chinese: ${w.chinese}`);
                console.log(`   English: ${w.english} ← PROBLEM: Contains Chinese!`);
                console.log('');
            } else {
                console.log(`✓  ID: ${w.id} | ${w.chinese} → ${w.english}`);
            }
        });

        console.log('─'.repeat(60));
        console.log(`\n📊 Summary: ${issueCount} out of ${result.length} words have issues`);

        if (issueCount > 0) {
            console.log('\n💡 The "english" field in the database contains Chinese characters.');
            console.log('   This is causing the Translation Practice to show Chinese in both the question AND answers.');
        }

        await client.end();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

checkWordsData();
