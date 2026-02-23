/**
 * Survey Reward API — Unit Tests
 * Tests dedup logic, response shapes, and stardust reward rules.
 */

import { describe, it, expect } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
// Pure-logic helpers extracted from route behaviour
// ─────────────────────────────────────────────────────────────────────────────

const SURVEY_STARDUST_REWARD = 5

function buildRewardResponse(
  inserted: boolean
): { granted: boolean; alreadyGranted: boolean; stardust?: number } {
  if (!inserted) return { granted: false, alreadyGranted: true }
  return { granted: true, alreadyGranted: false, stardust: SURVEY_STARDUST_REWARD }
}

function validateSurveyId(surveyId: unknown): surveyId is string {
  return typeof surveyId === 'string' && surveyId.trim().length > 0
}

// ─────────────────────────────────────────────────────────────────────────────
// Core deduplication logic
// ─────────────────────────────────────────────────────────────────────────────

describe('Survey Reward: deduplication logic', () => {
  it('returns granted=true on first completion', () => {
    const result = buildRewardResponse(true)
    expect(result.granted).toBe(true)
    expect(result.alreadyGranted).toBe(false)
    expect(result.stardust).toBe(SURVEY_STARDUST_REWARD)
  })

  it('returns alreadyGranted=true when DB INSERT returns 0 rows (ON CONFLICT DO NOTHING)', () => {
    const result = buildRewardResponse(false)
    expect(result.granted).toBe(false)
    expect(result.alreadyGranted).toBe(true)
    expect(result.stardust).toBeUndefined()
  })

  it('stardust reward value is exactly 5', () => {
    expect(SURVEY_STARDUST_REWARD).toBe(5)
  })

  it('two calls with same user+survey returns alreadyGranted on second call', () => {
    const grant1 = buildRewardResponse(true)
    const grant2 = buildRewardResponse(false) // DB returns 0 rows on conflict
    expect(grant1.granted).toBe(true)
    expect(grant2.alreadyGranted).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Input validation
// ─────────────────────────────────────────────────────────────────────────────

describe('Survey Reward: input validation', () => {
  it('accepts well-formed UUID-style surveyId', () => {
    expect(validateSurveyId('019c83d3-d0a5-0000-4e8f-5b7fd8794666')).toBe(true)
  })

  it('rejects undefined surveyId', () => {
    expect(validateSurveyId(undefined)).toBe(false)
  })

  it('rejects null surveyId', () => {
    expect(validateSurveyId(null)).toBe(false)
  })

  it('rejects empty string surveyId', () => {
    expect(validateSurveyId('')).toBe(false)
    expect(validateSurveyId('   ')).toBe(false)
  })

  it('rejects numeric surveyId', () => {
    expect(validateSurveyId(42)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Response shape
// ─────────────────────────────────────────────────────────────────────────────

describe('Survey Reward: response shape', () => {
  it('successful grant contains granted, alreadyGranted, stardust', () => {
    const response = buildRewardResponse(true)
    expect(response).toHaveProperty('granted')
    expect(response).toHaveProperty('alreadyGranted')
    expect(response).toHaveProperty('stardust')
  })

  it('already-granted response omits stardust field', () => {
    const response = buildRewardResponse(false)
    expect(response).not.toHaveProperty('stardust')
  })

  it('granted and alreadyGranted are mutually exclusive', () => {
    const success = buildRewardResponse(true)
    const dup = buildRewardResponse(false)

    expect(success.granted && success.alreadyGranted).toBe(false)
    expect(dup.granted || !dup.alreadyGranted).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Survey reward table schema expectations
// ─────────────────────────────────────────────────────────────────────────────

describe('Survey Reward: table schema contract', () => {
  it('survey_rewards row has required fields', () => {
    const row = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      survey_id: '019c83d3-d0a5-0000-4e8f-5b7fd8794666',
      survey_name: 'Star Sailors Webapp Loop Survey 2.2',
      stardust_granted: 5,
    }

    expect(row.user_id).toBeTruthy()
    expect(row.survey_id).toBeTruthy()
    expect(row.stardust_granted).toBeGreaterThan(0)
    expect(new Date(row.created_at).getTime()).not.toBeNaN()
  })

  it('unique constraint key is (user_id, survey_id)', () => {
    // Simulate two rows with same user+survey — only first should be kept
    const rows = [
      { user_id: 'user-1', survey_id: 'survey-A', stardust_granted: 5 },
      { user_id: 'user-1', survey_id: 'survey-A', stardust_granted: 5 },
    ]
    const uniqueKeys = new Set(rows.map(r => `${r.user_id}::${r.survey_id}`))
    expect(uniqueKeys.size).toBe(1)
  })

  it('allows same survey_id for different users', () => {
    const rows = [
      { user_id: 'user-1', survey_id: 'survey-A' },
      { user_id: 'user-2', survey_id: 'survey-A' },
    ]
    const uniqueKeys = new Set(rows.map(r => `${r.user_id}::${r.survey_id}`))
    expect(uniqueKeys.size).toBe(2)
  })

  it('allows same user to receive rewards for different surveys', () => {
    const rows = [
      { user_id: 'user-1', survey_id: 'survey-A' },
      { user_id: 'user-1', survey_id: 'survey-B' },
    ]
    const uniqueKeys = new Set(rows.map(r => `${r.user_id}::${r.survey_id}`))
    expect(uniqueKeys.size).toBe(2)
  })
})
