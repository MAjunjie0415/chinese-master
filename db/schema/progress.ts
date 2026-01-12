import { pgTable, text, integer, timestamp, jsonb, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { words } from './words';

export const userProgress = pgTable(
    'user_progress',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
        userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        wordId: integer('word_id').notNull().references(() => words.id, { onDelete: 'cascade' }),
        masteryScore: integer('mastery_score').default(0).notNull(), // 0-100
        reviewCount: integer('review_count').default(0).notNull(),
        correctCount: integer('correct_count').default(0).notNull(),
        errorHistory: jsonb('error_history').default([]).notNull(),
        firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
        lastReviewedAt: timestamp('last_reviewed_at'),
        nextReviewAt: timestamp('next_review_at'),
    },
    (table) => ({
        userWordIdx: uniqueIndex('idx_progress_user_word').on(table.userId, table.wordId),
        nextReviewIdx: index('idx_progress_next_review').on(table.nextReviewAt),
    })
);
