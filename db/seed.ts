import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { words } from './schema/words';
import { eq, and } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import csvParser from 'csv-parser';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;

// 创建数据库连接
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

// CSV行类型定义
interface BusinessWordRow {
  汉字: string;
  拼音: string;
  英文释义: string;
  场景标签?: string;
  例句?: string;
  category: string;
}

interface HSKWordRow {
  汉字: string;
  拼音: string;
  英文释义: string;
  等级: string;
  词频: string;
  category: string;
}

// 读取CSV文件
function readCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath, { encoding: 'utf-8' })
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// 批量插入数据（优化版本）
async function batchInsert(data: any[], batchSize: number = 500) {
  let inserted = 0;
  let skipped = 0;

  // 先获取数据库中所有现有的词汇（用于去重）
  console.log('  检查数据库中已存在的词汇...');
  const existingWords = await db.select({
    chinese: words.chinese,
    category: words.category
  }).from(words);

  const existingSet = new Set(
    existingWords.map(w => `${w.chinese}:${w.category}`)
  );

  // 过滤出需要插入的数据
  const toInsert = data.filter(item => {
    const key = `${item.chinese}:${item.category}`;
    if (existingSet.has(key)) {
      skipped++;
      return false;
    }
    return true;
  });

  console.log(`  需要插入: ${toInsert.length} 条, 跳过重复: ${skipped} 条`);

  // 批量插入
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);

    try {
      await db.insert(words).values(batch);
      inserted += batch.length;
      console.log(`  进度: ${Math.min(i + batchSize, toInsert.length)}/${toInsert.length}`);
    } catch (error) {
      console.error(`  批次插入失败，尝试逐条插入...`);
      // 如果批量插入失败，回退到逐条插入
      for (const item of batch) {
        try {
          await db.insert(words).values(item);
          inserted++;
        } catch (e) {
          console.error(`  跳过词汇: ${item.chinese}`);
          skipped++;
        }
      }
    }
  }

  return { inserted, skipped };
}

async function main() {
  console.log('🚀 开始导入词库数据...\n');

  try {
    // 1. 导入商务汉语词库
    console.log('📚 导入商务汉语词库...');
    const businessCsvPath = path.join(process.cwd(), 'business_words_clean.csv');
    const businessRows = await readCSV<BusinessWordRow>(businessCsvPath);

    const businessData = businessRows.map(row => ({
      chinese: row.汉字,
      pinyin: row.拼音,
      english: row.英文释义,
      scene: row.场景标签 || null,
      example: row.例句 || null,
      category: row.category,
      frequency: 3,
    }));

    const businessResult = await batchInsert(businessData);
    console.log(`✅ 商务汉语：成功导入 ${businessResult.inserted} 条，跳过重复 ${businessResult.skipped} 条\n`);

    // 2. 导入HSK词库
    console.log('📚 导入HSK词库...');
    const hskCsvPath = path.join(process.cwd(), 'hsk_words_clean.csv');
    const hskRows = await readCSV<HSKWordRow>(hskCsvPath);

    const hskData = hskRows.map(row => ({
      chinese: row.汉字,
      pinyin: row.拼音,
      english: row.英文释义,
      scene: null,
      example: null,
      category: row.category,
      frequency: parseInt(row.词频) || 3,
    }));

    const hskResult = await batchInsert(hskData);
    console.log(`✅ HSK词库：成功导入 ${hskResult.inserted} 条，跳过重复 ${hskResult.skipped} 条\n`);

    // 3. 打印总结
    const totalInserted = businessResult.inserted + hskResult.inserted;
    const totalSkipped = businessResult.skipped + hskResult.skipped;

    console.log('═'.repeat(60));
    console.log('🎉 导入完成！');
    console.log(`✅ 总计：成功导入 ${totalInserted} 条`);
    console.log(`⏭️  跳过重复：${totalSkipped} 条`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await client.end();
  }
}

// 执行导入
main();

