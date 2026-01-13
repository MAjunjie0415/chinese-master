/**
 * Seed script for Business Chinese courses
 * Creates 5 preset courses for business professionals
 */

import 'dotenv/config';
import { db, client } from '../lib/drizzle';
import { courses, courseWords } from '../db/schema/courses';
import { words } from '../db/schema/words';
import { eq, inArray } from 'drizzle-orm';

// Business Chinese course definitions
const businessCourses = [
    {
        title: 'Business Meeting Essentials',
        slug: 'business-meeting',
        category: 'business',
        description: 'Essential vocabulary for hosting and participating in Chinese business meetings.',
        difficulty: 'intermediate',
        words: [
            '会议', '议程', '主持', '发言', '讨论', '表决', '纪要', '会议室',
            '开会', '结束', '报告', '提问', '回答', '建议', '同意', '反对',
            '决定', '总结', '记录', '通知', '参加', '出席', '代表', '发表',
            '意见', '方案', '计划', '目标', '进度', '安排'
        ]
    },
    {
        title: 'Business Email Writing',
        slug: 'business-email',
        category: 'business',
        description: 'Professional vocabulary for writing business emails in Chinese.',
        difficulty: 'intermediate',
        words: [
            '尊敬', '您好', '感谢', '回复', '收到', '附件', '转发', '抄送',
            '确认', '通知', '请求', '咨询', '反馈', '期待', '祝好', '顺祝',
            '商祺', '敬请', '查收', '审阅', '批准', '答复', '联系', '沟通',
            '合作', '洽谈', '协商', '安排', '事宜', '事项'
        ]
    },
    {
        title: 'Business Negotiation',
        slug: 'business-negotiation',
        category: 'business',
        description: 'Key vocabulary for business negotiations and deal-making.',
        difficulty: 'advanced',
        words: [
            '谈判', '合同', '条款', '签订', '报价', '还价', '折扣', '利润',
            '成本', '预算', '付款', '交货', '质量', '数量', '期限', '违约',
            '赔偿', '保证', '承诺', '修改', '确认', '双方', '达成', '协议',
            '意向', '条件', '底线', '让步', '妥协', '成交'
        ]
    },
    {
        title: 'Business Socializing',
        slug: 'business-socializing',
        category: 'business',
        description: 'Vocabulary for networking and business social events in China.',
        difficulty: 'beginner',
        words: [
            '名片', '交换', '认识', '介绍', '久仰', '幸会', '请教', '合作',
            '拜访', '接待', '款待', '宴请', '敬酒', '干杯', '随意', '客气',
            '招待', '欢迎', '告辞', '再见', '保重', '联系', '拜托', '麻烦',
            '感谢', '荣幸', '光临', '指教', '多谢', '不客气'
        ]
    },
    {
        title: 'Office Daily Communication',
        slug: 'office-daily',
        category: 'business',
        description: 'Everyday office vocabulary for workplace communication.',
        difficulty: 'beginner',
        words: [
            '上班', '下班', '加班', '请假', '休假', '汇报', '任务', '完成',
            '进度', '问题', '解决', '帮助', '合作', '同事', '领导', '部门',
            '办公室', '电脑', '打印', '复印', '文件', '资料', '邮件', '电话',
            '开会', '安排', '提交', '审批', '通过', '修改'
        ]
    }
];

async function seedBusinessCourses() {
    console.log('🌱 Starting Business Chinese courses seed...\n');

    try {
        for (const courseData of businessCourses) {
            console.log(`📚 Processing: ${courseData.title}`);

            // Check if course already exists
            const existing = await db
                .select({ id: courses.id })
                .from(courses)
                .where(eq(courses.slug, courseData.slug))
                .limit(1);

            if (existing.length > 0) {
                console.log(`   ⚠️ Course already exists, skipping...`);
                continue;
            }

            // Find matching words in database
            const matchedWords = await db
                .select({ id: words.id, chinese: words.chinese })
                .from(words)
                .where(inArray(words.chinese, courseData.words));

            console.log(`   Found ${matchedWords.length}/${courseData.words.length} words in database`);

            if (matchedWords.length < 10) {
                console.log(`   ⚠️ Not enough words found, skipping...`);
                continue;
            }

            // Create course
            const [newCourse] = await db
                .insert(courses)
                .values({
                    title: courseData.title,
                    slug: courseData.slug,
                    category: courseData.category,
                    description: courseData.description,
                    difficulty: courseData.difficulty,
                    totalWords: matchedWords.length,
                    isCustom: false,
                })
                .returning({ id: courses.id });

            console.log(`   ✅ Created course ID: ${newCourse.id}`);

            // Add words to course
            const courseWordValues = matchedWords.map((word, index) => ({
                course_id: newCourse.id,
                word_id: word.id,
                order: index + 1,
            }));

            await db.insert(courseWords).values(courseWordValues);
            console.log(`   ✅ Added ${matchedWords.length} words to course\n`);
        }

        console.log('🎉 Business Chinese courses seed complete!');
    } catch (error) {
        console.error('Error seeding courses:', error);
    } finally {
        await client.end();
    }
}

seedBusinessCourses();
