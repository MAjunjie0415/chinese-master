import { pgTable, text, integer, timestamp, jsonb, index, customType } from 'drizzle-orm/pg-core';

const vector = customType<{ data: number[] }>({
    dataType() {
        return 'vector(1536)';
    },
});

export const cachedCourses = pgTable(
    'cached_courses',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
        promptEmbedding: vector('prompt_embedding').notNull(),
        promptHash: text('prompt_hash').notNull(),
        userLevel: text('user_level'),
        generatedCourse: jsonb('generated_course').notNull(),
        hitCount: integer('hit_count').default(0).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        lastHitAt: timestamp('last_hit_at'),
    },
    (table) => ({
        embeddingIdx: index('idx_cache_embedding').using('ivfflat', table.promptEmbedding),
        hashIdx: index('idx_cache_hash').on(table.promptHash),
    })
);
