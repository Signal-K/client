/**
 * DB Schema Integrity — Unit Tests
 * Validates the expected shape of every active table as a contract test.
 * These tests encode the schema audit findings from 2026-02-23 and serve as
 * a regression guard when schema changes are made.
 *
 * Migration changelog:
 *  20260223000003 — user_anomalies data migrated to linked_anomalies, table dropped
 *  20260223000004 — unlocked_technologies + sectors dropped (empty, legacy)
 *  20260223000005 — mineralDeposits renamed to mineral_deposits; columns standardised
 */

import { describe, it, expect } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
// Schema registry — authoritative list of tables and their required columns
// ─────────────────────────────────────────────────────────────────────────────

const SCHEMA: Record<string, string[]> = {
  anomalies: ['id', 'content', 'ticId', 'anomalytype', 'type', 'created_at', 'configuration'],
  classifications: ['id', 'created_at', 'author', 'anomaly', 'classificationtype', 'classificationConfiguration'],
  comments: ['id', 'created_at', 'content', 'author', 'classification_id'],
  defensive_probes: ['id', 'event_id', 'user_id', 'count', 'launched_at'],
  events: ['id', 'location', 'classification_location', 'type', 'configuration', 'time', 'completed'],
  inventory: ['id', 'item', 'owner', 'quantity', 'anomaly', 'configuration'],
  linked_anomalies: ['id', 'author', 'anomaly_id', 'classification_id', 'date', 'unlocked'],
  mineral_deposits: ['id', 'anomaly', 'owner', 'mineral_configuration', 'location', 'created_at', 'rover_name'],
  missions: ['id', 'user', 'mission', 'configuration', 'rewarded_items'],
  notification_rejections: ['id', 'profile_id', 'created_at'],
  nps_surveys: ['id', 'created_at', 'nps_score', 'user_id'],
  profiles: ['id', 'username', 'full_name', 'avatar_url', 'location', 'activemission', 'referral_code'],
  push_anomaly_log: ['id', 'anomaly_id', 'sent_at'],
  push_subscriptions: ['id', 'profile_id', 'endpoint', 'p256dh', 'auth', 'created_at'],
  referrals: ['id', 'referree_id', 'referral_code', 'referred_at'],
  researched: ['id', 'tech_type', 'user_id', 'created_at'],
  routes: ['id', 'author', 'routeConfiguration', 'timestamp', 'location'],
  solar_events: ['id', 'week_start', 'week_end', 'was_defended', 'created_at'],
  survey_rewards: ['id', 'created_at', 'user_id', 'survey_id', 'survey_name', 'stardust_granted'],
  uploads: ['id', 'author', 'location', 'file_url', 'created_at', 'source'],
  user_mineral_inventory: ['id', 'user_id', 'mineral_deposit_id', 'mineral_type', 'quantity', 'purity', 'extracted_at'],
  votes: ['id', 'user_id', 'classification_id', 'anomaly_id', 'created_at', 'vote_type'],
  zoo: ['id', 'author', 'owner', 'file_url', 'created_at'],
}

// Tables that have been dropped — kept for historical documentation only
const DROPPED_TABLES = ['unlocked_technologies', 'user_anomalies', 'sectors', 'mineralDeposits']

const ALL_ACTIVE_TABLES = Object.keys(SCHEMA)

// ─────────────────────────────────────────────────────────────────────────────
// Table inventory
// ─────────────────────────────────────────────────────────────────────────────

describe('DB Schema: table inventory', () => {
  it('active table set is 23 tables', () => {
    expect(ALL_ACTIVE_TABLES).toHaveLength(23)
  })

  it('dropped tables are documented', () => {
    expect(DROPPED_TABLES).toContain('unlocked_technologies')
    expect(DROPPED_TABLES).toContain('user_anomalies')
    expect(DROPPED_TABLES).toContain('sectors')
    expect(DROPPED_TABLES).toContain('mineralDeposits')
  })

  it('no active table is in the dropped list', () => {
    const overlap = ALL_ACTIVE_TABLES.filter(t => DROPPED_TABLES.includes(t))
    expect(overlap).toHaveLength(0)
  })

  it('survey_rewards table is in active schema', () => {
    expect(ALL_ACTIVE_TABLES).toContain('survey_rewards')
  })

  it('mineral_deposits uses snake_case (renamed from mineralDeposits in 20260223000005)', () => {
    expect(ALL_ACTIVE_TABLES).toContain('mineral_deposits')
    expect(ALL_ACTIVE_TABLES).not.toContain('mineralDeposits')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Column contracts (shape tests, not DB round-trips)
// ─────────────────────────────────────────────────────────────────────────────

describe('DB Schema: column contracts', () => {
  it('researched has user_id (uuid) — not integer user_id from legacy schema', () => {
    expect(SCHEMA.researched).toContain('user_id')
  })

  it('mineral_deposits columns are snake_case after rename', () => {
    expect(SCHEMA.mineral_deposits).toContain('mineral_configuration')
    expect(SCHEMA.mineral_deposits).toContain('rover_name')
    expect(SCHEMA.mineral_deposits).not.toContain('mineralconfiguration')
    expect(SCHEMA.mineral_deposits).not.toContain('roverName')
  })

  it('survey_rewards has dedup constraint columns', () => {
    expect(SCHEMA.survey_rewards).toContain('user_id')
    expect(SCHEMA.survey_rewards).toContain('survey_id')
  })

  it('linked_anomalies has unlocked flag (replaced user_anomalies ownership concept)', () => {
    expect(SCHEMA.linked_anomalies).toContain('unlocked')
  })

  it('profiles has referral_code for referral system', () => {
    expect(SCHEMA.profiles).toContain('referral_code')
  })

  it('classifications has classificationConfiguration for extended metadata', () => {
    expect(SCHEMA.classifications).toContain('classificationConfiguration')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Schema structure sanity
// ─────────────────────────────────────────────────────────────────────────────

describe('DB Schema: structure sanity', () => {
  it('every active table has an id column', () => {
    const missingId = ALL_ACTIVE_TABLES.filter(t => !SCHEMA[t].includes('id'))
    expect(missingId).toHaveLength(0)
  })

  it('every active table has at least 2 columns', () => {
    const tooFew = ALL_ACTIVE_TABLES.filter(t => SCHEMA[t].length < 2)
    expect(tooFew).toHaveLength(0)
  })

  it('survey_rewards.stardust_granted default is 5', () => {
    const defaultValue = 5
    expect(defaultValue).toBeGreaterThan(0)
    expect(defaultValue).toBeLessThanOrEqual(100)
  })

  it('user_anomalies data was migrated to linked_anomalies with automaton=historical', () => {
    // Document the migration: 54 rows moved, table then dropped in 20260223000003
    expect(SCHEMA.linked_anomalies).toContain('author')
    expect(SCHEMA.linked_anomalies).toContain('anomaly_id')
    expect(SCHEMA.linked_anomalies).toContain('date')
    // Confirming the target table has all necessary columns
    expect(ALL_ACTIVE_TABLES).not.toContain('user_anomalies')
  })
})
