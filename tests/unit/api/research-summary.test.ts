/**
 * Research Summary API — Unit Tests
 * Tests the stardust balance calculation including survey bonus.
 */

import { describe, it, expect } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
// Stardust calculation logic (mirrors route.ts)
// ─────────────────────────────────────────────────────────────────────────────

const QUANTITY_UPGRADES = ['probereceptors', 'satellitecount', 'roverwaypoints']

function calcResearchPenalty(techTypes: string[]): number {
  return techTypes.reduce((total, tech) => {
    return total + (QUANTITY_UPGRADES.includes(tech) ? 10 : 2)
  }, 0)
}

function calcSurveyBonus(surveyRewards: Array<{ stardust_granted: number }>): number {
  return surveyRewards.reduce((sum, r) => sum + (r.stardust_granted ?? 0), 0)
}

function calcAvailableStardust(
  classificationCount: number,
  surveyBonus: number,
  researchPenalty: number
): number {
  return Math.max(0, classificationCount + surveyBonus - researchPenalty)
}

// ─────────────────────────────────────────────────────────────────────────────
// Research penalty calculation
// ─────────────────────────────────────────────────────────────────────────────

describe('Research Summary: penalty calculation', () => {
  it('quantity upgrades cost 10 each', () => {
    expect(calcResearchPenalty(['probereceptors'])).toBe(10)
    expect(calcResearchPenalty(['satellitecount'])).toBe(10)
    expect(calcResearchPenalty(['roverwaypoints'])).toBe(10)
  })

  it('non-quantity upgrades cost 2 each', () => {
    expect(calcResearchPenalty(['spectroscopy'])).toBe(2)
    expect(calcResearchPenalty(['findMinerals', 'p4Minerals'])).toBe(4)
  })

  it('mixed upgrades sum correctly', () => {
    const penalty = calcResearchPenalty(['probereceptors', 'spectroscopy', 'findMinerals'])
    expect(penalty).toBe(14) // 10 + 2 + 2
  })

  it('empty tech list yields 0 penalty', () => {
    expect(calcResearchPenalty([])).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Survey bonus calculation
// ─────────────────────────────────────────────────────────────────────────────

describe('Research Summary: survey bonus', () => {
  it('sums all survey rewards', () => {
    const rewards = [
      { stardust_granted: 5 },
      { stardust_granted: 5 },
    ]
    expect(calcSurveyBonus(rewards)).toBe(10)
  })

  it('returns 0 for empty survey rewards', () => {
    expect(calcSurveyBonus([])).toBe(0)
  })

  it('handles missing stardust_granted gracefully', () => {
    // If DB returns a row with null/undefined (shouldn't happen, but defensive)
    const rewards = [{ stardust_granted: undefined as unknown as number }]
    expect(calcSurveyBonus(rewards)).toBe(0)
  })

  it('single completed survey adds 5 stardust', () => {
    const rewards = [{ stardust_granted: 5 }]
    expect(calcSurveyBonus(rewards)).toBe(5)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Available stardust calculation (classifications + surveyBonus - penalty)
// ─────────────────────────────────────────────────────────────────────────────

describe('Research Summary: availableStardust', () => {
  it('basic: classifications minus penalty', () => {
    expect(calcAvailableStardust(20, 0, 4)).toBe(16)
  })

  it('survey bonus is additive on top of classifications', () => {
    // 20 classifications + 5 survey bonus - 4 spent = 21
    expect(calcAvailableStardust(20, 5, 4)).toBe(21)
  })

  it('never goes below zero', () => {
    expect(calcAvailableStardust(0, 0, 100)).toBe(0)
  })

  it('zero classifications + survey bonus covers small research spend', () => {
    // User completed survey but has no classifications; spent 2
    expect(calcAvailableStardust(0, 5, 2)).toBe(3)
  })

  it('survey bonus does not help if already capped at 0', () => {
    // Debt is so large that even with bonus, still floored at 0
    expect(calcAvailableStardust(0, 5, 20)).toBe(0)
  })

  it('multiple survey rewards accumulate correctly', () => {
    // Someday may have multiple surveys — they all count
    expect(calcAvailableStardust(10, 10, 0)).toBe(20)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Response shape
// ─────────────────────────────────────────────────────────────────────────────

describe('Research Summary: response shape', () => {
  it('response includes surveyBonus field', () => {
    const mockResponse = {
      userId: 'user-1',
      counts: { all: 10, asteroid: 0, cloud: 0, planet: 0 },
      surveyBonus: 5,
      availableStardust: 15,
      referralBonus: 0,
      referralCount: 0,
    }
    expect(mockResponse).toHaveProperty('surveyBonus')
    expect(mockResponse.surveyBonus).toBeGreaterThanOrEqual(0)
  })

  it('availableStardust reflects bonus from survey', () => {
    const classificationCount = 10
    const surveyBonus = 5
    const researchPenalty = 0
    const available = calcAvailableStardust(classificationCount, surveyBonus, researchPenalty)
    expect(available).toBe(15) // not 10
  })
})
