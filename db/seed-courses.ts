/**
 * 课程数据种子脚本（v1.1）
 * 创建初始示例课程
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { courses, courseWords } from './schema/courses';
import { words } from './schema/words';
import { eq, and } from 'drizzle-orm';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🌱 开始创建初始课程数据...\n');

  const client = postgres(databaseUrl);
  const db = drizzle(client);

  try {
    // 1. 创建商务汉语课程
    console.log('📚 创建商务汉语课程...');
    
    const businessCourses = [
      {
        title: 'Business Negotiation Essentials',
        slug: 'business-negotiation-essentials',
        category: 'business',
        description: 'Master 30 essential words for business negotiations, including terms for pricing, contracts, and deal-making.',
        difficulty: 'intermediate',
      },
      {
        title: 'Business Email Writing',
        slug: 'business-email-writing',
        category: 'business',
        description: 'Learn 25 key phrases for professional email communication in Chinese business contexts.',
        difficulty: 'beginner',
      },
      {
        title: 'Meeting and Presentation Skills',
        slug: 'meeting-presentation-skills',
        category: 'business',
        description: 'Essential vocabulary for conducting meetings and giving presentations in Chinese.',
        difficulty: 'intermediate',
      },
    ];

    for (const course of businessCourses) {
      const [insertedCourse] = await db
        .insert(courses)
        .values(course)
        .returning();
      
      console.log(`  ✓ 创建课程: ${course.title}`);

      // 从words表中查询对应category的单词
      const categoryWords = await db
        .select()
        .from(words)
        .where(eq(words.category, course.category))
        .limit(30)
        .execute();

      // 将单词关联到课程
      if (categoryWords.length > 0) {
        const courseWordValues = categoryWords.map((word, index) => ({
          course_id: insertedCourse.id,
          word_id: word.id,
          order: index + 1,
        }));

        await db.insert(courseWords).values(courseWordValues);
        
        // 更新课程的总单词数
        await db
          .update(courses)
          .set({ totalWords: categoryWords.length })
          .where(eq(courses.id, insertedCourse.id));

        console.log(`    → 添加了 ${categoryWords.length} 个单词`);
      }
    }

    // 2. 创建HSK等级课程
    console.log('\n📚 创建HSK等级课程...');
    
    const hskLevels = [
      { level: 1, title: 'HSK 1 Foundation', description: 'Master 150 basic Chinese words for HSK 1 exam', difficulty: 'beginner' },
      { level: 2, title: 'HSK 2 Building Blocks', description: 'Learn 150 essential words for HSK 2 exam', difficulty: 'beginner' },
      { level: 3, title: 'HSK 3 Intermediate', description: 'Build vocabulary with 300 words for HSK 3 exam', difficulty: 'intermediate' },
      { level: 4, title: 'HSK 4 Upper Intermediate', description: 'Expand your knowledge with 600 words for HSK 4 exam', difficulty: 'intermediate' },
      { level: 5, title: 'HSK 5 Advanced', description: 'Master 1300 words for HSK 5 exam', difficulty: 'advanced' },
      { level: 6, title: 'HSK 6 Proficiency', description: 'Reach fluency with 2500 words for HSK 6 exam', difficulty: 'advanced' },
    ];

    for (const hsk of hskLevels) {
      const courseData = {
        title: hsk.title,
        slug: `hsk-${hsk.level}-course`,
        category: `hsk${hsk.level}`,
        description: hsk.description,
        difficulty: hsk.difficulty,
      };

      const [insertedCourse] = await db
        .insert(courses)
        .values(courseData)
        .returning();
      
      console.log(`  ✓ 创建课程: ${hsk.title}`);

      // 从words表中查询对应HSK等级的单词
      const hskWords = await db
        .select()
        .from(words)
        .where(eq(words.category, `hsk${hsk.level}`))
        .limit(50) // 每个课程先添加50个单词作为示例
        .execute();

      // 将单词关联到课程
      if (hskWords.length > 0) {
        const courseWordValues = hskWords.map((word, index) => ({
          course_id: insertedCourse.id,
          word_id: word.id,
          order: index + 1,
        }));

        await db.insert(courseWords).values(courseWordValues);
        
        // 更新课程的总单词数
        await db
          .update(courses)
          .set({ totalWords: hskWords.length })
          .where(eq(courses.id, insertedCourse.id));

        console.log(`    → 添加了 ${hskWords.length} 个单词`);
      }
    }

    console.log('\n✅ 课程数据创建完成！');
    console.log('\n📊 统计:');
    const allCourses = await db.select().from(courses);
    console.log(`  - 总课程数: ${allCourses.length}`);
    console.log(`  - 商务课程: ${allCourses.filter(c => c.category === 'business').length}`);
    console.log(`  - HSK课程: ${allCourses.filter(c => c.category.startsWith('hsk')).length}`);

  } catch (error) {
    console.error('❌ 种子数据创建失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main()
  .then(() => {
    console.log('\n✨ 所有操作完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('错误:', error);
    process.exit(1);
  });


