import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { index } from 'drizzle-orm/pg-core';

export const words = pgTable(
  'words',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
    chinese: text('chinese').notNull(),
    pinyin: text('pinyin').notNull(),
    english: text('english').notNull(),
    scene: text('scene'),
    example: text('example'),
    category: text('category').notNull(),
    frequency: integer('frequency').default(3).notNull(),
  },
  (table) => ({
    categoryIdx: index('words_category_idx').on(table.category),
  })
);

