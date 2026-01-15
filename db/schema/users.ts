import { pgTable, text, integer, timestamp, boolean, uuid, date, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(), // Links to auth.users in Supabase
  email: text('email').notNull(),
  inviteQuota: integer('invite_quota').default(3).notNull(),
  invitedCount: integer('invited_count').default(0).notNull(),
  isPro: boolean('is_pro').default(false).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  plan: text('plan', { enum: ['free', 'pro', 'enterprise'] }).default('free').notNull(),
  customCourseUsageCount: integer('custom_course_usage_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userUsage = pgTable('user_usage', {
  id: integer('id').generatedAlwaysAsIdentity().notNull(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  usageDate: date('usage_date').defaultNow().notNull(),
  generationCount: integer('generation_count').default(0).notNull(),
  pronunciationCount: integer('pronunciation_count').default(0).notNull(),
}, (table) => ({
  userDatePk: primaryKey({ columns: [table.userId, table.usageDate] }),
}));
