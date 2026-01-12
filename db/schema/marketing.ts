import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userWishes = pgTable('user_wishes', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    status: text('status').default('pending').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

export const inviteCodes = pgTable('invite_codes', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull().unique(),
    generated_by: uuid('generated_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    is_used: boolean('is_used').default(false).notNull(),
    used_by: uuid('used_by').references(() => users.id),
    used_at: timestamp('used_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
