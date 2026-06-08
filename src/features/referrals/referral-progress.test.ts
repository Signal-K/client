import { describe, it, expect } from 'vitest'
import { getReferralProgress, REFERRAL_TIERS } from './referral-progress'

describe('getReferralProgress', () => {
  it('returns no completed tiers at 0 referrals', () => {
    const p = getReferralProgress(0)
    expect(p.completedTiers).toHaveLength(0)
    expect(p.nextTier?.id).toBe('cadet')
    expect(p.progressToNext).toBe(0)
    expect(p.referralsCount).toBe(0)
  })

  it('completes cadet at 1 referral', () => {
    const p = getReferralProgress(1)
    expect(p.completedTiers).toHaveLength(1)
    expect(p.completedTiers[0].id).toBe('cadet')
    expect(p.nextTier?.id).toBe('navigator')
  })

  it('completes navigator at 3 referrals', () => {
    const p = getReferralProgress(3)
    expect(p.completedTiers).toHaveLength(2)
    expect(p.completedTiers[1].id).toBe('navigator')
    expect(p.nextTier?.id).toBe('captain')
  })

  it('completes captain at 5 referrals', () => {
    const p = getReferralProgress(5)
    expect(p.completedTiers).toHaveLength(3)
    expect(p.completedTiers[2].id).toBe('captain')
    expect(p.nextTier?.id).toBe('admiral')
  })

  it('completes all tiers at 10 referrals', () => {
    const p = getReferralProgress(10)
    expect(p.completedTiers).toHaveLength(4)
    expect(p.nextTier).toBeNull()
    expect(p.progressToNext).toBe(1)
  })

  it('progress is between 0 and 1 mid-tier', () => {
    const p = getReferralProgress(2)
    expect(p.progressToNext).toBeGreaterThan(0)
    expect(p.progressToNext).toBeLessThanOrEqual(1)
  })

  it('clamps negative count to 0', () => {
    expect(getReferralProgress(-5).referralsCount).toBe(0)
  })

  it('floors decimal counts', () => {
    expect(getReferralProgress(0.9).referralsCount).toBe(0)
    expect(getReferralProgress(1.9).referralsCount).toBe(1)
  })

  it('treats non-finite values as 0', () => {
    expect(getReferralProgress(Infinity).referralsCount).toBe(0)
    expect(getReferralProgress(NaN).referralsCount).toBe(0)
  })

  it('REFERRAL_TIERS has 4 tiers in ascending target order', () => {
    expect(REFERRAL_TIERS).toHaveLength(4)
    for (let i = 1; i < REFERRAL_TIERS.length; i++) {
      expect(REFERRAL_TIERS[i].target).toBeGreaterThan(REFERRAL_TIERS[i - 1].target)
    }
  })
})
