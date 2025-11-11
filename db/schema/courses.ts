import { pgTable, text, integer, timestamp, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { index, unique } from 'drizzle-orm/pg-core';
import { words } from './words';

/**
 * 课程主表（v1.1新增）
 * 存储所有可用的学习课程
 */
export const courses = pgTable('courses', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
  title: text('title').notNull(), // 课程标题，如"商务谈判核心词汇"
  slug: text('slug').notNull().unique(), // URL友好的标识符，如"business-negotiation-basics"
  category: text('category').notNull(), // 分类："business" 或 "hsk1"-"hsk6"
  coverImage: text('cover_image'), // 封面图URL
  description: text('description'), // 课程描述
  totalWords: integer('total_words').default(0).notNull(), // 课程包含的单词总数
  difficulty: text('difficulty').default('beginner'), // 难度：beginner/intermediate/advanced
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('courses_category_idx').on(table.category),
  slugIdx: index('courses_slug_idx').on(table.slug),
}));

/**
 * 用户-课程关联表（v1.1新增）
 * 记录用户获取（添加）的课程
 */
export const userCourses = pgTable(
  'user_courses',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
    user_id: text('user_id').notNull(), // Supabase Auth的UUID（text类型）
    course_id: integer('course_id').notNull(),
    progress: integer('progress').default(0).notNull(), // 进度百分比（0-100）
    lastLearnedAt: timestamp('last_learned_at'), // 最后学习时间
    isCompleted: boolean('is_completed').default(false).notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    // 外键约束：关联courses表
    courseFk: foreignKey({
      columns: [table.course_id],
      foreignColumns: [courses.id],
      name: 'user_courses_course_id_fk',
    }).onDelete('cascade'),
    // 联合唯一索引：防止用户重复添加同一课程
    userCourseUnique: unique('user_courses_user_course_unique').on(table.user_id, table.course_id),
    // 联合索引：提高用户课程查询效率
    userIdIdx: index('user_courses_user_id_idx').on(table.user_id),
    courseIdIdx: index('user_courses_course_id_idx').on(table.course_id),
  })
);

/**
 * 课程-单词关联表（v1.1新增）
 * 定义每个课程包含哪些单词及顺序
 */
export const courseWords = pgTable(
  'course_words',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
    course_id: integer('course_id').notNull(),
    word_id: integer('word_id').notNull(), // 关联v1.0的words表（integer类型）
    order: integer('order').notNull(), // 单词在课程中的顺序（1,2,3...）
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // 外键约束：关联courses表
    courseFk: foreignKey({
      columns: [table.course_id],
      foreignColumns: [courses.id],
      name: 'course_words_course_id_fk',
    }).onDelete('cascade'),
    // 外键约束：关联words表（v1.0）
    wordFk: foreignKey({
      columns: [table.word_id],
      foreignColumns: [words.id],
      name: 'course_words_word_id_fk',
    }).onDelete('cascade'),
    // 联合唯一索引：防止课程中重复添加同一单词
    courseWordUnique: unique('course_words_course_word_unique').on(table.course_id, table.word_id),
    // 索引：提高课程单词查询效率
    courseIdIdx: index('course_words_course_id_idx').on(table.course_id),
    wordIdIdx: index('course_words_word_id_idx').on(table.word_id), // 优化 review 页面查询性能
    orderIdx: index('course_words_order_idx').on(table.course_id, table.order),
  })
);

/**
 * 练习记录表（v1.1新增）
 * 记录用户的练习历史和成绩
 */
export const practiceRecords = pgTable(
  'practice_records',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
    user_id: text('user_id').notNull(), // Supabase Auth的UUID（text类型）
    course_id: integer('course_id').notNull(),
    mode: text('mode').notNull(), // 练习模式："translate"/"dictation"/"listening"/"speaking"
    duration: integer('duration'), // 练习时长（秒）
    correctCount: integer('correct_count').default(0).notNull(), // 正确题目数
    totalCount: integer('total_count').default(0).notNull(), // 总题目数
    accuracy: integer('accuracy').default(0).notNull(), // 正确率（0-100）
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // 外键约束：关联courses表
    courseFk: foreignKey({
      columns: [table.course_id],
      foreignColumns: [courses.id],
      name: 'practice_records_course_id_fk',
    }).onDelete('cascade'),
    // 索引：提高用户练习记录查询效率
    userIdIdx: index('practice_records_user_id_idx').on(table.user_id),
    courseIdIdx: index('practice_records_course_id_idx').on(table.course_id),
    modeIdx: index('practice_records_mode_idx').on(table.mode),
    createdAtIdx: index('practice_records_created_at_idx').on(table.createdAt),
  })
);


