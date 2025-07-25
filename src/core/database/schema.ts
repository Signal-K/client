import { pgTable, bigint, text, uuid, timestamp, jsonb, boolean, integer, varchar, doublePrecision, bigserial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  updated_at: timestamp('updated_at').defaultNow(),
  username: text('username'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  website: text('website'),
  location: bigint('location', { mode: 'number' }),
  activemission: bigint('activemission', { mode: 'number' }),
  classificationPoints: bigint('classificationPoints', { mode: 'number' }),
  push_subscription: jsonb('push_subscription'),
});

// Anomalies table
export const anomalies = pgTable('anomalies', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  content: text('content'),
  ticId: text('ticId'),
  anomalytype: text('anomalytype'),
  type: text('type'),
  radius: doublePrecision('radius'),
  mass: doublePrecision('mass'),
  density: doublePrecision('density'),
  gravity: doublePrecision('gravity'),
  temperatureEq: doublePrecision('temperatureEq'),
  temperature: doublePrecision('temperature'),
  smaxis: doublePrecision('smaxis'),
  orbital_period: doublePrecision('orbital_period'),
  classification_status: text('classification_status'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  deepnote: text('deepnote'),
  lightkurve: text('lightkurve'),
  configuration: jsonb('configuration'),
  parentAnomaly: bigint('parentAnomaly', { mode: 'number' }),
  anomalySet: text('anomalySet'),
});

// Classifications table
export const classifications = pgTable('classifications', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  content: text('content'),
  author: uuid('author'),
  anomaly: bigint('anomaly', { mode: 'number' }),
  media: jsonb('media'),
  classificationtype: text('classificationtype'),
  classificationConfiguration: jsonb('classificationConfiguration'),
});

// Comments table
export const comments = pgTable('comments', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  content: text('content').notNull(),
  author: uuid('author').notNull(),
  classification_id: bigint('classification_id', { mode: 'number' }),
  parent_comment_id: bigint('parent_comment_id', { mode: 'number' }),
  configuration: jsonb('configuration'),
  uploads: bigint('uploads', { mode: 'number' }),
  surveyor: boolean('surveyor'),
  confirmed: boolean('confirmed'),
  value: text('value'),
  category: text('category'),
});

// Linked Anomalies table
export const linked_anomalies = pgTable('linked_anomalies', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  author: uuid('author').notNull(),
  anomaly_id: bigint('anomaly_id', { mode: 'number' }).notNull(),
  classification_id: bigint('classification_id', { mode: 'number' }).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  automaton: text('automaton'),
});

// Researched table
export const researched = pgTable('researched', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  tech_type: varchar('tech_type', { length: 50 }).notNull(),
  tech_id: integer('tech_id'),
  created_at: timestamp('created_at').defaultNow(),
  user_id: uuid('user_id'),
});

// Events table
export const events = pgTable('events', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  title: text('title'),
  description: text('description'),
  type: text('type'),
  classification_location: bigint('classification_location', { mode: 'number' }),
  configuration: jsonb('configuration'),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  classifications: many(classifications),
  comments: many(comments),
  linked_anomalies: many(linked_anomalies),
  researched: many(researched),
}));

export const anomaliesRelations = relations(anomalies, ({ many }) => ({
  classifications: many(classifications),
  linked_anomalies: many(linked_anomalies),
}));

export const classificationsRelations = relations(classifications, ({ one, many }) => ({
  author: one(profiles, {
    fields: [classifications.author],
    references: [profiles.id],
  }),
  anomaly: one(anomalies, {
    fields: [classifications.anomaly],
    references: [anomalies.id],
  }),
  comments: many(comments),
  linked_anomalies: many(linked_anomalies),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(profiles, {
    fields: [comments.author],
    references: [profiles.id],
  }),
  classification: one(classifications, {
    fields: [comments.classification_id],
    references: [classifications.id],
  }),
}));

export const linkedAnomaliesRelations = relations(linked_anomalies, ({ one }) => ({
  author: one(profiles, {
    fields: [linked_anomalies.author],
    references: [profiles.id],
  }),
  anomaly: one(anomalies, {
    fields: [linked_anomalies.anomaly_id],
    references: [anomalies.id],
  }),
  classification: one(classifications, {
    fields: [linked_anomalies.classification_id],
    references: [classifications.id],
  }),
}));

export const researchedRelations = relations(researched, ({ one }) => ({
  user: one(profiles, {
    fields: [researched.user_id],
    references: [profiles.id],
  }),
}));
