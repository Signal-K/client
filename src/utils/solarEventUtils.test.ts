import { describe, it, expect } from 'vitest'
import {
  getWeekStart,
  getWeekEnd,
  formatTimeRemaining,
  getStarName,
  STAR_NAMES,
  calculateProgressPercentage,
  isInCurrentWeek,
} from './solarEventUtils'

describe('getWeekStart', () => {
  it('returns a Sunday', () => {
    const wed = new Date('2024-01-10T12:00:00')
    expect(getWeekStart(wed).getDay()).toBe(0)
  })
  it('sets time to midnight', () => {
    const date = new Date('2024-01-10T15:30:00')
    const start = getWeekStart(date)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
  })
  it('is not after the input date', () => {
    const date = new Date('2024-01-10T12:00:00')
    expect(getWeekStart(date).getTime()).toBeLessThanOrEqual(date.getTime())
  })
  it('is within 7 days before the input date', () => {
    const date = new Date('2024-01-10T12:00:00')
    const diff = date.getTime() - getWeekStart(date).getTime()
    expect(diff).toBeLessThan(7 * 24 * 60 * 60 * 1000)
  })
  it('is idempotent for a Sunday midnight', () => {
    const sun = new Date('2024-01-07T00:00:00')
    const start = getWeekStart(sun)
    expect(getWeekStart(start).getTime()).toBe(start.getTime())
  })
})

describe('getWeekEnd', () => {
  it('is exactly 7 days after week start', () => {
    const date = new Date('2024-01-10T12:00:00')
    const diff = getWeekEnd(date).getTime() - getWeekStart(date).getTime()
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000)
  })
})

describe('formatTimeRemaining', () => {
  it('returns "Event ended" for past dates', () => {
    expect(formatTimeRemaining(new Date(Date.now() - 1000))).toBe('Event ended')
  })
  it('formats multi-day events as "Xd Yh remaining"', () => {
    const future = new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000)
    expect(formatTimeRemaining(future)).toMatch(/^\d+d \d+h remaining$/)
  })
  it('formats sub-day events as "Xh Ym remaining"', () => {
    const future = new Date(Date.now() + 5 * 60 * 60 * 1000)
    expect(formatTimeRemaining(future)).toMatch(/^\d+h \d+m remaining$/)
  })
  it('formats sub-hour events as "Xm remaining"', () => {
    const future = new Date(Date.now() + 30 * 60 * 1000)
    expect(formatTimeRemaining(future)).toMatch(/^\d+m remaining$/)
  })
})

describe('getStarName', () => {
  it('returns a value from STAR_NAMES', () => {
    expect(STAR_NAMES).toContain(getStarName(new Date('2024-01-07T00:00:00')) as any)
  })
  it('covers all star names across 12 consecutive weeks', () => {
    const seen = new Set<string>()
    for (let i = 0; i < STAR_NAMES.length; i++) {
      seen.add(getStarName(new Date(i * 7 * 24 * 60 * 60 * 1000)))
    }
    expect(seen.size).toBe(STAR_NAMES.length)
  })
})

describe('isInCurrentWeek', () => {
  it('current time is in current week', () => {
    expect(isInCurrentWeek(new Date())).toBe(true)
  })
  it('10 days ago is not in current week', () => {
    expect(isInCurrentWeek(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))).toBe(false)
  })
  it('10 days in the future is not in current week', () => {
    expect(isInCurrentWeek(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000))).toBe(false)
  })
})

describe('calculateProgressPercentage', () => {
  it('returns 50 for half progress', () => expect(calculateProgressPercentage(5, 10)).toBe(50))
  it('caps at 100', () => expect(calculateProgressPercentage(200, 100)).toBe(100))
  it('returns 0 for zero current', () => expect(calculateProgressPercentage(0, 100)).toBe(0))
  it('rounds to nearest integer', () => expect(calculateProgressPercentage(1, 3)).toBe(33))
  it('returns 100 at threshold', () => expect(calculateProgressPercentage(10, 10)).toBe(100))
})
