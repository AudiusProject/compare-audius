// db/schema.ts

import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const platforms = sqliteTable('platforms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo').notNull(),
  isAudius: integer('is_audius', { mode: 'boolean' }).notNull().default(false),
  isDraft: integer('is_draft', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const features = sqliteTable('features', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  sortOrder: integer('sort_order').notNull(),
  isDraft: integer('is_draft', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const comparisons = sqliteTable('comparisons', {
  id: text('id').primaryKey(),
  platformId: text('platform_id').notNull().references(() => platforms.id, { onDelete: 'cascade' }),
  featureId: text('feature_id').notNull().references(() => features.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['yes', 'no', 'partial', 'custom'] }).notNull(),
  displayValue: text('display_value'),
  context: text('context'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  // Unique constraint: one comparison per platform-feature pair
  platformFeatureUnique: uniqueIndex('platform_feature_unique').on(table.platformId, table.featureId),
}));

// Type exports
export type Platform = typeof platforms.$inferSelect;
export type NewPlatform = typeof platforms.$inferInsert;
export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;
export type Comparison = typeof comparisons.$inferSelect;
export type NewComparison = typeof comparisons.$inferInsert;
