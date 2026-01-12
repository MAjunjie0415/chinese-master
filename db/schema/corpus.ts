import { pgTable, text, integer, timestamp, boolean, index, customType } from 'drizzle-orm/pg-core';

// Custom type for pgvector
const vector = customType<{ data: number[] }>({
    dataType() {
        return 'vector(384)';
    },
});

export const goldenCorpus = pgTable(
    'golden_corpus',
    {
        id: integer('id').primaryKey().generatedAlwaysAsIdentity().notNull(),
        chinese: text('chinese').notNull().unique(),
        pinyin: text('pinyin').notNull(),
        english: text('english').notNull(),
        level: text('level', { enum: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6', 'Business'] }).notNull(),
        category: text('category'), // e.g., grammar, vocabulary
        scene: text('scene'),       // e.g., meeting, airport
        exampleSentence: text('example_sentence'),
        audioUrl: text('audio_url'),
        embedding: vector('embedding'),
        source: text('source'),     // e.g., official HSK, custom
        verified: boolean('verified').default(false).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => ({
        embeddingIdx: index('idx_corpus_embedding').using('ivfflat', table.embedding),
        levelIdx: index('idx_corpus_level').on(table.level),
    })
);
