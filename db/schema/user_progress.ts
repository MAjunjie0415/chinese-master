import { pgTable, text, integer, timestamp, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { index, unique } from 'drizzle-orm/pg-core';
import { words } from './words';

export const userProgress = pgTable(
  'user_progress',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
    user_id: text('user_id').notNull(),
    word_id: integer('word_id').notNull(),
    last_reviewed: timestamp('last_reviewed').defaultNow().notNull(),
    next_review: timestamp('next_review').notNull(),
    mastered: boolean('mastered').default(false).notNull(),
  },
  (table) => ({
    // 外键约束：关联words表
    wordFk: foreignKey({
      columns: [table.word_id],
      foreignColumns: [words.id],
      name: 'user_progress_word_id_fk',
    }).onDelete('cascade'),
    // 联合唯一索引：防止同一用户重复记录同一单词
    userWordUnique: unique('user_progress_user_word_unique').on(table.user_id, table.word_id),
    // 联合索引：提高复习查询效率
    userNextReviewIdx: index('user_progress_user_next_review_idx').on(table.user_id, table.next_review),
  })
);

